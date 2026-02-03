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
    private final com.tycoon.forge.domain.relic.service.RelicService relicService;
    private final Random random;

    @org.springframework.beans.factory.annotation.Autowired
    public EnhanceService(UserRepository userRepository, com.tycoon.forge.domain.relic.service.RelicService relicService) {
        this.userRepository = userRepository;
        this.relicService = relicService;
        this.random = new Random();
    }

    @Transactional
    public EnhanceDto.Response enhance(UUID userId, EnhanceDto.Request request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        int currentLevel = request.getCurrentLevel();
        BigInteger itemBaseValue = request.getItemBaseValue();

        // 1. Calculate Enhance Cost: Base * (Level + 1)^2
        long costVal = itemBaseValue.longValue() * (long) Math.pow(currentLevel + 1, 2);
        
        // Relic Effect: ANCIENT_ANVIL (Cost Reduction)
        double costReduction = relicService.getEffectMultiplier(userId, com.tycoon.forge.domain.relic.entity.RelicType.ANCIENT_ANVIL);
        long reducedCostVal = (long) (costVal * (1.0 - costReduction));
        BigInteger enhanceCost = BigInteger.valueOf(reducedCostVal);

        if (user.getGold().compareTo(enhanceCost) < 0) {
            throw new IllegalStateException("골드가 부족합니다.");
        }

        // Deduct Cost First
        user.subtractGold(enhanceCost);

        // 2. Probability Logic
        double successRate;
        double destroyRate;
        
        if (currentLevel < 5) { // 0, 1, 2, 3, 4 -> +1 ~ +5
            // Safe Zone: 99% -> 95% (Decay 1% per level)
            successRate = 0.99 - (currentLevel * 0.01); 
            destroyRate = 0.0;
        } else if (currentLevel < 10) { // 5, 6, 7, 8, 9 -> +6 ~ +10
            // Mid Zone : 75% -> 55% (Decay 5% per level)
            // Lv 5: 0.75 - (0 * 0.05) = 0.75
            // Lv 9: 0.75 - (4 * 0.05) = 0.55
            successRate = 0.75 - ((currentLevel - 5) * 0.05); 
            destroyRate = 0.0; 
        } else if (currentLevel < 15) { // 10 ~ 14 -> +11 ~ +15
            // High Risk Zone: 45% -> 25% (Decay 5% per level)
            // Lv 10: 0.45 - (0 * 0.05) = 0.45
            // Lv 14: 0.45 - (4 * 0.05) = 0.25
            successRate = 0.45 - ((currentLevel - 10) * 0.05); 
            destroyRate = 0.01; // Fixed 1% destroy
        } else { // 15+ -> +16 ~
            // Hell Zone (Existing Logic)
            successRate = 0.10;
            destroyRate = 0.20 + ((currentLevel - 15) * 0.05); 
        }
        
        // Relic Effect: GOLDEN_HAMMER (Success Rate +)
        double successBonus = relicService.getEffectMultiplier(userId, com.tycoon.forge.domain.relic.entity.RelicType.GOLDEN_HAMMER);
        successRate += successBonus;
        
        // Relic Effect: LUCKY_CLOVER (Destroy Rate -)
        if (destroyRate > 0) {
            double destroyReduction = relicService.getEffectMultiplier(userId, com.tycoon.forge.domain.relic.entity.RelicType.LUCKY_CLOVER);
            destroyRate = Math.max(0, destroyRate - destroyReduction);
        }
        
        // 3. Roll
        double roll = random.nextDouble();
        EnhanceDto.Result result;
        
        if (roll < successRate) {
            result = EnhanceDto.Result.SUCCESS;
        } else if (roll < successRate + destroyRate) {
            result = EnhanceDto.Result.DESTROY;
        } else {
            result = EnhanceDto.Result.FAIL;
        }

        // 4. Apply Results
        int newLevel = currentLevel;
        BigInteger goldChange = enhanceCost.negate(); // Start with cost deduction
        int reputationChange = 0;
        String message = "";
        
        switch (result) {
            case SUCCESS:
                newLevel = currentLevel + 1;
                user.updateHighestLevel(newLevel);
                
                // No immediate gold reward for enhancing, only cost. 
                // Money is made via Contracts.
                
                reputationChange = 5 + newLevel; 
                user.updateReputation(reputationChange);
                
                message = "강화 성공!";
                break;
                
            case FAIL:
                if (currentLevel >= 10) {
                     newLevel = Math.max(0, currentLevel - 1);
                     message = "강화 실패... 등급 하락";
                } else if (currentLevel >= 5) {
                     // Requested: 5~9 Maintain on fail
                     newLevel = currentLevel;
                     message = "강화 실패... (등급 유지)";
                } else {
                     // Safe zone fail -> No drop (technically impossible with 99% logic usually, but keep safe)
                     newLevel = currentLevel; 
                     message = "강화 실패...";
                }
                reputationChange = -2;
                user.decreaseReputation(2);
                break;
                
            case DESTROY:
                newLevel = 0; // Item gone
                reputationChange = -50;
                user.decreaseReputation(50);
                
                message = "아이템 파괴!! 처음부터 다시 시작...";
                break;
        }
        
        userRepository.save(user);

        return EnhanceDto.Response.builder()
                .result(result)
                .newLevel(newLevel)
                .goldChange(goldChange) // This shows the net change (just cost usually)
                .reputationChange(reputationChange)
                .message(message)
                .build();
    }

    public EnhanceDto.ProbabilityResponse getProbabilities(int currentLevel) {
        double successRate;
        double destroyRate;

        if (currentLevel < 5) { 
            successRate = 0.99 - (currentLevel * 0.01); 
            destroyRate = 0.0;
        } else if (currentLevel < 10) { 
            successRate = 0.75 - ((currentLevel - 5) * 0.05); 
            destroyRate = 0.0; 
        } else if (currentLevel < 15) { 
            successRate = 0.45 - ((currentLevel - 10) * 0.05); 
            destroyRate = 0.01; 
        } else { 
            successRate = 0.10;
            destroyRate = 0.20 + ((currentLevel - 15) * 0.05); 
        }
        
        // Base fail rate assuming no relics for display (Frontend might not know relics easily yet)
        // Or we could pass userId to calculate relics. For now let's show BASE probabilities.
        // Ideally should include relics but let's stick to base for now as requested "Probability display".
        // Actually, user would want to see their ACTUAL probability. 
        // Let's modify signature to accept UUID if possible, but controller might just pass level.
        // Let's stick to base logic for the HUD '?' button for now to keep it simple, 
        // OR changing it to contextual. 
        // Let's return the BASE rates. Relics are hidden bonuses.
        
        double failRate = 1.0 - successRate - destroyRate;
        if (failRate < 0) failRate = 0;

        return new EnhanceDto.ProbabilityResponse(successRate, failRate, destroyRate);
    }
}
