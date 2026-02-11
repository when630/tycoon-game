package com.tycoon.forge.domain.game.service;

import com.tycoon.forge.domain.game.dto.EnhanceDto;
import com.tycoon.forge.domain.relic.entity.RelicType;
import com.tycoon.forge.domain.relic.service.RelicService;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigInteger;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EnhanceServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RelicService relicService;

    @Mock
    private Random random;

    private EnhanceService enhanceService;
    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        enhanceService = new EnhanceService(userRepository, relicService, random);
        userId = UUID.randomUUID();
        testUser = User.builder()
                .id(userId)
                .nickname("TestSmith")
                .gold(BigInteger.valueOf(10000))
                .highestLevel(0)
                .reputation(0)
                .build();
    }

    @Test
    @DisplayName("강화 성공: 레벨 0 -> 1 (비용 차감, 평판 증가, 레벨 증가)")
    void enhance_Success() {
        // Given
        int currentLevel = 0;
        BigInteger baseValue = BigInteger.valueOf(100);
        EnhanceDto.Request request = new EnhanceDto.Request(baseValue, currentLevel);

        // Cost: 100 * (0 + 1)^2 = 100
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(relicService.getEffectMultiplier(any(), any())).willReturn(0.0);

        // Success Logic: Level 0 -> 99% success rate
        // random.nextDouble() < 0.99 -> Success
        given(random.nextDouble()).willReturn(0.5); // 0.5 < 0.99

        // When
        EnhanceDto.Response response = enhanceService.enhance(userId, request);

        // Then
        assertThat(response.getResult()).isEqualTo(EnhanceDto.Result.SUCCESS);
        assertThat(response.getNewLevel()).isEqualTo(1);
        assertThat(testUser.getHighestLevel()).isEqualTo(1);
        assertThat(testUser.getGold()).isEqualByComparingTo(BigInteger.valueOf(9900)); // 10000 - 100
        assertThat(testUser.getReputation()).isEqualTo(6); // 5 + 1

        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("강화 실패: 골드 부족")
    void enhance_NotEnoughGold() {
        // Given
        testUser.setGold(BigInteger.ZERO);
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));

        EnhanceDto.Request request = new EnhanceDto.Request(BigInteger.valueOf(100), 0);

        // When & Then
        assertThatThrownBy(() -> enhanceService.enhance(userId, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("골드가 부족합니다");
    }

    @Test
    @DisplayName("강화 실패: 레벨 10 -> 10 (실패 시 레벨 하락)")
    void enhance_Fail_LevelDrop() {
        // Given
        int currentLevel = 10;
        testUser.setHighestLevel(10);
        testUser.updateCurrentItemLevel(10);
        BigInteger baseValue = BigInteger.valueOf(100);

        // Cost: 100 * 11^2 = 12100 -> Need more gold for test
        testUser.setGold(BigInteger.valueOf(20000));

        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(relicService.getEffectMultiplier(any(), any())).willReturn(0.0);

        // Logic check: Level 10
        // Success: 45% (0.45)
        // Destroy: 1% (0.01) -> 0.45 ~ 0.46
        // Fail: Above 0.46
        given(random.nextDouble()).willReturn(0.8);

        // When
        EnhanceDto.Response response = enhanceService.enhance(userId, new EnhanceDto.Request(baseValue, currentLevel));

        // Then
        assertThat(response.getResult()).isEqualTo(EnhanceDto.Result.FAIL);
        assertThat(response.getNewLevel()).isEqualTo(9); // Dropped
        assertThat(testUser.getReputation()).isEqualTo(-2);
    }

    @Test
    @DisplayName("강화 파괴: 레벨 15 (파괴 발생)")
    void enhance_Destroy() {
        // Given
        int currentLevel = 15;
        testUser.setHighestLevel(15);
        testUser.updateCurrentItemLevel(15);
        testUser.setGold(BigInteger.valueOf(100000));

        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(relicService.getEffectMultiplier(any(), any())).willReturn(0.0);

        // Logic Level 15
        // Success: 10% (0.10)
        // Destroy: 20% (0.20) -> 0.10 ~ 0.30
        given(random.nextDouble()).willReturn(0.15); // Hits Destroy range

        // When
        EnhanceDto.Response response = enhanceService.enhance(userId,
                new EnhanceDto.Request(BigInteger.valueOf(100), currentLevel));

        // Then
        assertThat(response.getResult()).isEqualTo(EnhanceDto.Result.DESTROY);
        assertThat(response.getNewLevel()).isEqualTo(0);
        assertThat(testUser.getReputation()).isEqualTo(-50);
    }

    @Test
    @DisplayName("유물 효과: 비용 할인")
    void enhance_Relic_CostDiscount() {
        // Given
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));

        // 50% discount
        given(relicService.getEffectMultiplier(userId, RelicType.ANCIENT_ANVIL)).willReturn(0.5);
        given(random.nextDouble()).willReturn(0.0); // Success

        EnhanceDto.Request request = new EnhanceDto.Request(BigInteger.valueOf(100), 0);
        // Original Cost: 100
        // Discounted: 50

        // When
        enhanceService.enhance(userId, request);

        // Then
        assertThat(testUser.getGold()).isEqualByComparingTo(BigInteger.valueOf(9950));
    }

    @Test
    @DisplayName("유물 효과: 비용 할인 최대 100% (오버플로우 방지)")
    void enhance_Relic_CostDiscount_Cap() {
        // Given
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));

        // 120% discount (Level 24 Ancient Anvil)
        given(relicService.getEffectMultiplier(userId, RelicType.ANCIENT_ANVIL)).willReturn(1.2);
        given(random.nextDouble()).willReturn(0.0); // Success

        EnhanceDto.Request request = new EnhanceDto.Request(BigInteger.valueOf(100), 0);
        // Original Cost: 100
        // Discounted: 0 (Capped at 100%) - Should NOT be negative

        // When
        enhanceService.enhance(userId, request);

        // Then
        // Gold should match original (cost 0)
        assertThat(testUser.getGold()).isEqualByComparingTo(BigInteger.valueOf(10000));
    }
}