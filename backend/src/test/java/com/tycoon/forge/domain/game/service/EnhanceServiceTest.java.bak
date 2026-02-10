package com.tycoon.forge.domain.game.service;

import com.tycoon.forge.domain.game.dto.EnhanceDto;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EnhanceServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Random random;

    @Test
    @DisplayName("강화 성공 테스트 (+0 -> +1)")
    void enhanceSuccess() {
        // given
        EnhanceService enhanceService = new EnhanceService(userRepository, random);
        UUID userId = UUID.randomUUID();
        User user = User.builder().nickname("tester").build();
        
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(random.nextDouble()).willReturn(0.0); // Force Success (0.0 < 0.9)
        
        EnhanceDto.Request request = new EnhanceDto.Request(BigInteger.valueOf(100), 0);

        // when
        EnhanceDto.Response response = enhanceService.enhance(userId, request);

        // then
        assertThat(response.getResult()).isEqualTo(EnhanceDto.Result.SUCCESS);
        assertThat(response.getNewLevel()).isEqualTo(1);
        assertThat(response.getMessage()).contains("강화 성공");
        assertThat(response.getGoldChange()).isGreaterThan(BigInteger.ZERO);
    }

    @Test
    @DisplayName("강화 실패 테스트 (+10 -> +9)")
    void enhanceFail() {
        // given
        EnhanceService enhanceService = new EnhanceService(userRepository, random);
        UUID userId = UUID.randomUUID();
        User user = User.builder().nickname("tester").build();
        user.updateHighestLevel(10);
        
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        // +6~+10 Success 0.55, Destroy 0.05 -> Fail range is 0.6 ~ 1.0
        given(random.nextDouble()).willReturn(0.9); 
        
        EnhanceDto.Request request = new EnhanceDto.Request(BigInteger.valueOf(100), 10);

        // when
        EnhanceDto.Response response = enhanceService.enhance(userId, request);

        // then
        assertThat(response.getResult()).isEqualTo(EnhanceDto.Result.FAIL);
        assertThat(response.getNewLevel()).isEqualTo(9);
        assertThat(response.getReputationChange()).isNegative();
    }
}
