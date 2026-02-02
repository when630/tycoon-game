package com.tycoon.forge.domain.game.service;

import com.tycoon.forge.domain.game.dto.EnhanceDto;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Random;
import java.util.UUID;

@Service
public class EnhanceService {

    private final UserRepository userRepository;
    private final Random random;

    @org.springframework.beans.factory.annotation.Autowired
    public EnhanceService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.random = new Random();
    }

    // For Testing
    public EnhanceService(UserRepository userRepository, Random random) {
        this.userRepository = userRepository;
        this.random = random;
    }

    @Transactional
    public EnhanceDto.Response enhance(UUID userId, EnhanceDto.Request request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int currentLevel = request.getCurrentLevel();
        BigInteger itemBaseValue = request.getItemBaseValue();
        
        // Probability Logic
        double successRate;
        double destroyRate;
        double failRate;
        double payoutMultiplier;
        
        if (currentLevel <= 5) { // +1 ~ +5 (Level 0 -> 1 ... 4 -> 5 is treated here?)
            // Assuming currentLevel starts at 0 for +1 attempt? Or 1 for +2?
            // GDD: +1 ~ +5
            successRate = 0.90; // Avg 100~80%
            destroyRate = 0.0;
            payoutMultiplier = 0.5;
        } else if (currentLevel <= 10) { // +6 ~ +10
            successRate = 0.55; // Avg 70~40%
            destroyRate = 0.05;
            payoutMultiplier = 2.0;
        } else if (currentLevel <= 15) { // +11 ~ +15
            successRate = 0.22; // Avg 30~15%
            destroyRate = 0.15;
            payoutMultiplier = 8.0;
        } else { // +16 ~ +20
            successRate = 0.05; // Avg 10~1%
            destroyRate = 0.30;
            payoutMultiplier = 25.0;
        }
        
        // Calculate Rates
        double roll = random.nextDouble();
        EnhanceDto.Result result;
        
        if (roll < successRate) {
            result = EnhanceDto.Result.SUCCESS;
        } else if (roll < successRate + destroyRate) {
            result = EnhanceDto.Result.DESTROY;
        } else {
            result = EnhanceDto.Result.FAIL;
        }

        // Apply Results
        int newLevel = currentLevel;
        BigInteger goldChange = BigInteger.ZERO;
        int reputationChange = 0;
        String message = "";
        
        switch (result) {
            case SUCCESS:
                newLevel = currentLevel + 1;
                user.updateHighestLevel(newLevel);
                
                // Reward Calculation: Base * Multiplier
                goldChange = new BigDecimal(itemBaseValue).multiply(BigDecimal.valueOf(payoutMultiplier)).toBigInteger();
                user.addGold(goldChange);
                
                reputationChange = 10 + (newLevel * 2); // Simple reputation gain formula
                user.updateReputation(reputationChange);
                
                message = "강화 성공! +" + newLevel;
                break;
                
            case FAIL:
                if (currentLevel > 10) {
                     newLevel = Math.max(0, currentLevel - 1);
                     // Repair cost? For now usually just loss of attempt or downgrade
                     message = "강화 실패... 등급 하락";
                } else {
                     // Low level fail might just be no change or -1 depending on strictness
                     // GDD says "Fail: -1 drop"
                     newLevel = Math.max(0, currentLevel - 1);
                     message = "강화 실패...";
                }
                reputationChange = -2;
                user.decreaseReputation(2);
                break;
                
            case DESTROY:
                newLevel = 0; // Item gone
                
                // Compensation: Base * Level Coefficient (Simplified as 5 * level for now or just high penalty)
                // GDD: [Item Base * Level Coefficient]
                // Let's use 1.5 * Level as coefficient example
                double penaltyCoef = 1.5 * currentLevel;
                BigInteger penalty = new BigDecimal(itemBaseValue).multiply(BigDecimal.valueOf(penaltyCoef)).toBigInteger();
                
                user.subtractGold(penalty);
                goldChange = penalty.negate();
                
                reputationChange = -50;
                user.decreaseReputation(50);
                
                message = "아이템 파괴!! 배상금 발생: " + penalty;
                break;
        }
        
        userRepository.save(user);

        return EnhanceDto.Response.builder()
                .result(result)
                .newLevel(newLevel)
                .goldChange(goldChange)
                .reputationChange(reputationChange)
                .message(message)
                .build();
    }
}
