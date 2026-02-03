package com.tycoon.forge.domain.relic.service;

import com.tycoon.forge.domain.relic.dto.RelicDto;
import com.tycoon.forge.domain.relic.entity.RelicType;
import com.tycoon.forge.domain.relic.entity.UserRelic;
import com.tycoon.forge.domain.relic.repository.UserRelicRepository;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelicService {

    private final UserRelicRepository userRelicRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    private static final BigInteger GACHA_COST = BigInteger.valueOf(5000);

    @Transactional
    public RelicDto.Response gachaRelic(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (user.getGold().compareTo(GACHA_COST) < 0) {
            throw new IllegalStateException("골드가 부족합니다. (필요: " + GACHA_COST + ")");
        }

        user.subtractGold(GACHA_COST);

        // Random Relic Type
        RelicType[] types = RelicType.values();
        RelicType selectedType = types[random.nextInt(types.length)];

        UserRelic userRelic = userRelicRepository.findByUserIdAndRelicType(userId, selectedType)
                .orElse(UserRelic.builder()
                        .user(user)
                        .relicType(selectedType)
                        .level(0)
                        .build());

        userRelic.levelUp();
        userRelicRepository.save(userRelic);
        
        // Update user to persist gold change
        userRepository.save(user);

        return RelicDto.Response.from(userRelic);
    }

    @Transactional(readOnly = true)
    public List<RelicDto.Response> getUserRelics(UUID userId) {
        return userRelicRepository.findAllByUserId(userId).stream()
                .map(RelicDto.Response::from)
                .collect(Collectors.toList());
    }
    
    // Helper for other services
    public double getEffectMultiplier(UUID userId, RelicType type) {
        return userRelicRepository.findByUserIdAndRelicType(userId, type)
                .map(r -> r.getLevel() * type.getEffectValue())
                .orElse(0.0);
    }
}
