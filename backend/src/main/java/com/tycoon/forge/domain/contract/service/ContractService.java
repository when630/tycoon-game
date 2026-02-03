package com.tycoon.forge.domain.contract.service;

import com.tycoon.forge.domain.contract.dto.ContractDto;
import com.tycoon.forge.domain.contract.entity.Contract;
import com.tycoon.forge.domain.contract.entity.ContractStatus;
import com.tycoon.forge.domain.contract.repository.ContractRepository;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import com.tycoon.forge.domain.relic.service.RelicService;
import com.tycoon.forge.domain.relic.entity.RelicType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final RelicService relicService;
    private final Random random = new Random();

    @Transactional
    public List<ContractDto.Response> generateAvailableContracts(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // Clear existing AVAILABLE contracts (refresh pool)
        List<Contract> existingAvailable = contractRepository.findAllByUserIdAndStatus(userId, ContractStatus.AVAILABLE);
        // Clean up old available contracts (mark as failed or just delete? marking failed for history)
        for(Contract c : existingAvailable) {
            c.fail(); 
        }

        List<ContractDto.Response> newContracts = new ArrayList<>();
        
        // Generate 3 new contracts
        for (int i = 0; i < 3; i++) {
            Contract contract = createSingleContract(user);
            contract.makeAvailable(); // Set status to AVAILABLE
            contractRepository.save(contract);
            newContracts.add(ContractDto.Response.from(contract));
        }

        return newContracts;
    }

    private Contract createSingleContract(User user) {
        int reputation = user.getReputation();
        int baseTarget;

        if (reputation < 100) {
            baseTarget = 3 + random.nextInt(3); // 3~5
        } else if (reputation < 500) {
            baseTarget = 6 + random.nextInt(4); // 6~9
        } else if (reputation < 1000) {
             baseTarget = 10 + random.nextInt(4); // 10~13
        } else if (reputation < 2000) {
             baseTarget = 14 + random.nextInt(3); // 14~16 (Very Hard)
        } else {
             baseTarget = 17 + random.nextInt(4); // 17~20 (Hell)
        }

        // Slight variation
        baseTarget += random.nextInt(3) - 1; // -1, 0, +1
        if (baseTarget < 1) baseTarget = 1;

        long estimatedCost = 0;
        for (int i = 0; i < baseTarget; i++) {
             long stepCost = 100L * (long) Math.pow(i + 1, 2);
             double difficultyMultiplier = 1.0;
             if (i >= 5) difficultyMultiplier = 1.5; 
             if (i >= 10) difficultyMultiplier = 3.0;
             if (i >= 15) difficultyMultiplier = 5.0; // Extreme scaling
             estimatedCost += (long) (stepCost * difficultyMultiplier);
        }

        long rewardVal = (long) (estimatedCost * 1.5);
        
        // Bonus reward for higher reputation
        if (reputation >= 1000) {
            rewardVal = (long) (rewardVal * 1.2);
        }
        
        long penaltyVal = rewardVal / 3;

        return Contract.builder()
                .user(user)
                .targetLevel(baseTarget)
                .rewardGold(BigInteger.valueOf(rewardVal))
                .penaltyGold(BigInteger.valueOf(penaltyVal))
                .build();
    }
    
    @Transactional(readOnly = true)
    public List<ContractDto.Response> getAvailableContracts(UUID userId) {
        return contractRepository.findAllByUserIdAndStatus(userId, ContractStatus.AVAILABLE).stream()
                .map(ContractDto.Response::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContractDto.Response acceptContract(UUID userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("의뢰를 찾을 수 없습니다."));
        
        if (!contract.getUser().getId().equals(userId)) {
             throw new IllegalArgumentException("당신의 의뢰가 아닙니다.");
        }

        contract.accept(); // Changes status to PENDING
        return ContractDto.Response.from(contract);
    }

    @Transactional(readOnly = true)
    public List<ContractDto.Response> getActiveContracts(UUID userId) {
        return contractRepository.findAllByUserIdAndStatus(userId, ContractStatus.PENDING).stream()
                .map(ContractDto.Response::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContractDto.Response completeContract(UUID userId, Long contractId, int currentItemLevel) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("의뢰를 찾을 수 없습니다."));

        if (!contract.getUser().getId().equals(userId)) {
             throw new IllegalArgumentException("당신의 의뢰가 아닙니다.");
        }
        
        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new IllegalStateException("진행 중인 의뢰가 아닙니다.");
        }

        User user = contract.getUser();

        if (currentItemLevel >= contract.getTargetLevel()) {
            contract.complete();
            
            // Relic Bonus: MERCHANT_CERTIFICATE
            double bonusPercent = relicService.getEffectMultiplier(userId, RelicType.MERCHANT_CERTIFICATE);
            BigInteger reward = contract.getRewardGold();
            BigInteger bonus = new java.math.BigDecimal(reward).multiply(java.math.BigDecimal.valueOf(bonusPercent)).toBigInteger();
            
            user.addGold(reward.add(bonus));
            user.updateReputation(contract.getTargetLevel() * 10);
        } else {
            throw new IllegalArgumentException("목표 등급에 도달하지 못했습니다.");
        }
        
        return ContractDto.Response.from(contract);
    }

    @Transactional
    public ContractDto.Response cancelContract(UUID userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("의뢰를 찾을 수 없습니다."));

        if (!contract.getUser().getId().equals(userId)) {
             throw new IllegalArgumentException("당신의 의뢰가 아닙니다.");
        }
        
        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new IllegalStateException("진행 중인 의뢰가 아닙니다.");
        }

        contract.fail(); // Mark as FAILED or create a CANCELED status (Going with fail/cancel concept)
        
        User user = contract.getUser();
        // Big Penalty
        user.decreaseReputation(100); 
        // Potentially check if reputation goes below 0? 
        // Current User entity decreas just subtracts. 
        // Let's assume negative reputation is possible/allowed or handled there.
        
        return ContractDto.Response.from(contract);
    }
}
