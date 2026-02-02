package com.tycoon.forge.domain.contract.service;

import com.tycoon.forge.domain.contract.dto.ContractDto;
import com.tycoon.forge.domain.contract.entity.Contract;
import com.tycoon.forge.domain.contract.entity.ContractStatus;
import com.tycoon.forge.domain.contract.repository.ContractRepository;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final com.tycoon.forge.domain.relic.service.RelicService relicService;
    private final Random random = new Random();

    @Transactional
    public ContractDto.Response generateContract(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Fail existing pending contract if any
        contractRepository.findByUserIdAndStatus(userId, ContractStatus.PENDING)
                .ifPresent(contract -> {
                    contract.fail();
                    // Optional: Apply penalty for abandoning? For now, just mark failed.
                });

        // Calculate difficulty based on reputation
        int reputation = user.getReputation();
        int baseTarget;

        if (reputation < 100) {
            baseTarget = 3 + random.nextInt(3); // 3~5
        } else if (reputation < 500) {
            baseTarget = 6 + random.nextInt(4); // 6~9
        } else {
            baseTarget = 10 + random.nextInt(4); // 10~13
        }

        // Calculate Reward based on Estimated Cost
        // Cost func: Base(100) * (Lv+1)^2
        // We sum costs from Lv0 to TargetLv
        long estimatedCost = 0;
        for (int i = 0; i < baseTarget; i++) {
             // Cost to go from i to i+1
             long stepCost = 100L * (long) Math.pow(i + 1, 2);
             
             // Adjust for fail rate (Expected Value)
             // Simple multiplier to account for fails
             double difficultyMultiplier = 1.0;
             if (i >= 5) difficultyMultiplier = 1.5; 
             if (i >= 10) difficultyMultiplier = 3.0;
             
             estimatedCost += (long) (stepCost * difficultyMultiplier);
        }

        // Reward = Estimated Cost * 1.5 (Profit Margin)
        long rewardVal = (long) (estimatedCost * 1.5);
        long penaltyVal = rewardVal / 3; // Penalty is 1/3 of reward

        Contract contract = Contract.builder()
                .user(user)
                .targetLevel(baseTarget)
                .rewardGold(BigInteger.valueOf(rewardVal))
                .penaltyGold(BigInteger.valueOf(penaltyVal))
                .build();

        contractRepository.save(contract);

        return ContractDto.Response.from(contract);
    }

    @Transactional(readOnly = true)
    public ContractDto.Response getCurrentContract(UUID userId) {
        return contractRepository.findByUserIdAndStatus(userId, ContractStatus.PENDING)
                .map(ContractDto.Response::from)
                .orElse(null);
    }

    @Transactional
    public ContractDto.Response completeContract(UUID userId, int currentItemLevel) {
        Contract contract = contractRepository.findByUserIdAndStatus(userId, ContractStatus.PENDING)
                .orElseThrow(() -> new IllegalArgumentException("No pending contract found"));

        User user = contract.getUser();

        if (currentItemLevel >= contract.getTargetLevel()) {
            contract.complete();
            
            // Relic Bonus: MERCHANT_CERTIFICATE
            double bonusPercent = relicService.getEffectMultiplier(userId, com.tycoon.forge.domain.relic.entity.RelicType.MERCHANT_CERTIFICATE);
            BigInteger reward = contract.getRewardGold();
            BigInteger bonus = new java.math.BigDecimal(reward).multiply(java.math.BigDecimal.valueOf(bonusPercent)).toBigInteger();
            
            user.addGold(reward.add(bonus));
            user.updateReputation(contract.getTargetLevel() * 10);
        } else {
            throw new IllegalArgumentException("Target level not reached");
        }
        
        // Save changes (User update is handled by transaction, Contract by dirty checking)
        return ContractDto.Response.from(contract);
    }
}
