package com.tycoon.forge.domain.game.service;

import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameService {

    private final UserRepository userRepository;

    @Transactional
    public BigInteger sellItem(UUID userId, int currentLevel, BigInteger itemBaseValue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (currentLevel <= 0) {
            throw new IllegalArgumentException("0강 아이템은 판매할 수 없습니다.");
        }

        // Calculate Total Cost spent to reach this level
        long totalCost = 0;
        for (int i = 0; i < currentLevel; i++) {
            // Cost to go from i to i+1
            long stepCost = itemBaseValue.longValue() * (long) Math.pow(i + 1, 2);
            totalCost += stepCost;
        }

        // Reward = Total Cost * 1.2
        long rewardVal = (long) (totalCost * 1.2);
        BigInteger reward = BigInteger.valueOf(rewardVal);

        user.addGold(reward);
        
        // No need to "reset" the item in DB if the DB doesn't track item state per se.
        // The frontend will treat it as reset. 
        // If we tracked item level in DB, we'd reset it here. 
        // (Assuming current architecture relies on Frontend state + verification in request)

        return reward;
    }
}
