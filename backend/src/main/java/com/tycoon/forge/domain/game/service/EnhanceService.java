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
    public EnhanceService(UserRepository userRepository,
            com.tycoon.forge.domain.relic.service.RelicService relicService) {
        this(userRepository, relicService, new Random());
    }

    public EnhanceService(UserRepository userRepository,
            com.tycoon.forge.domain.relic.service.RelicService relicService, Random random) {
        this.userRepository = userRepository;
        this.relicService = relicService;
        this.random = random;
    }

    @Transactional
    public EnhanceDto.Response enhance(UUID userId, EnhanceDto.Request request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // Use server-side state for level
        int currentLevel = user.getCurrentItemLevel();

        // Optional: Validate request level matches server level (to prevent
        // desync/cheating)
        if (request.getCurrentLevel() != currentLevel) {
            // For now, just log or warn, but let's trust server state.
            // Or throw exception to force client refresh.
            // throw new IllegalArgumentException("Client level mismatch. Please refresh.");
        }

        BigInteger itemBaseValue = request.getItemBaseValue();

        // 1. Calculate Enhance Cost: Base * (Level + 1)^2
        long costVal = itemBaseValue.longValue() * (long) Math.pow(currentLevel + 1, 2);

        // Relic Effect: ANCIENT_ANVIL (Cost Reduction)
        double costReduction = relicService.getEffectMultiplier(userId,
                com.tycoon.forge.domain.relic.entity.RelicType.ANCIENT_ANVIL);

        // Cap reduction at 100% (free) to prevent negative cost (gaining gold)
        costReduction = Math.min(costReduction, 1.0);

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
        double successBonus = relicService.getEffectMultiplier(userId,
                com.tycoon.forge.domain.relic.entity.RelicType.GOLDEN_HAMMER);
        successRate += successBonus;

        // Relic Effect: LUCKY_CLOVER (Destroy Rate -)
        if (destroyRate > 0) {
            double destroyReduction = relicService.getEffectMultiplier(userId,
                    com.tycoon.forge.domain.relic.entity.RelicType.LUCKY_CLOVER);
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
                user.updateCurrentItemLevel(newLevel);

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
                    // Safe zone fail -> No drop
                    newLevel = currentLevel;
                    message = "강화 실패...";
                }
                user.updateCurrentItemLevel(newLevel);

                reputationChange = -2;
                user.decreaseReputation(2);
                break;

            case DESTROY:
                newLevel = 0; // Item gone
                user.updateCurrentItemLevel(0);

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

    public EnhanceDto.ProbabilityResponse getProbabilities(UUID userId, int currentLevel) {
        double baseSuccessRate;
        double baseDestroyRate;

        if (currentLevel < 5) {
            baseSuccessRate = 0.99 - (currentLevel * 0.01);
            baseDestroyRate = 0.0;
        } else if (currentLevel < 10) {
            baseSuccessRate = 0.75 - ((currentLevel - 5) * 0.05);
            baseDestroyRate = 0.0;
        } else if (currentLevel < 15) {
            baseSuccessRate = 0.45 - ((currentLevel - 10) * 0.05);
            baseDestroyRate = 0.01;
        } else {
            baseSuccessRate = 0.10;
            baseDestroyRate = 0.20 + ((currentLevel - 15) * 0.05);
        }

        // Relic Effect: GOLDEN_HAMMER (Success Rate +)
        double relicSuccessBonus = relicService.getEffectMultiplier(userId,
                com.tycoon.forge.domain.relic.entity.RelicType.GOLDEN_HAMMER);
        double finalSuccessRate = baseSuccessRate + relicSuccessBonus;

        // Relic Effect: LUCKY_CLOVER (Destroy Rate -)
        double relicDestroyReduction = 0.0;
        double finalDestroyRate = baseDestroyRate;

        if (baseDestroyRate > 0) {
            relicDestroyReduction = relicService.getEffectMultiplier(userId,
                    com.tycoon.forge.domain.relic.entity.RelicType.LUCKY_CLOVER);
            finalDestroyRate = Math.max(0, baseDestroyRate - relicDestroyReduction);
        }

        double finalFailRate = 1.0 - finalSuccessRate - finalDestroyRate;
        if (finalFailRate < 0)
            finalFailRate = 0;

        return EnhanceDto.ProbabilityResponse.builder()
                .successRate(finalSuccessRate)
                .baseSuccessRate(baseSuccessRate)
                .relicSuccessBonus(relicSuccessBonus)
                .destroyRate(finalDestroyRate)
                .baseDestroyRate(baseDestroyRate)
                .relicDestroyReduction(relicDestroyReduction)
                .failRate(finalFailRate)
                .build();
    }
}
