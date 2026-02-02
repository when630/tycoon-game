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
            baseTarget = 10 + random.nextInt(3); // 10~12
        }

        // Calculate Reward and Penalty
        // Reward = Base * 2^(target-3) (Just an example formula)
        // Adjust for economy later
        long rewardVal = 500L * (long) Math.pow(1.5, baseTarget);
        long penaltyVal = rewardVal / 2;

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
            user.addGold(contract.getRewardGold());
            user.updateReputation(contract.getTargetLevel() * 10);
        } else {
            throw new IllegalArgumentException("Target level not reached");
        }
        
        // Save changes (User update is handled by transaction, Contract by dirty checking)
        return ContractDto.Response.from(contract);
    }
}
