package com.tycoon.forge.domain.contract.service;

import com.tycoon.forge.domain.contract.dto.ContractDto;
import com.tycoon.forge.domain.contract.entity.Contract;
import com.tycoon.forge.domain.contract.entity.ContractStatus;
import com.tycoon.forge.domain.contract.repository.ContractRepository;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigInteger;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ContractService contractService;

    @Test
    @DisplayName("의뢰 생성 테스트 (평판 0 -> 난이도 +3~+5)")
    void generateContract() {
        // given
        UUID userId = UUID.randomUUID();
        User user = User.builder().nickname("tester").build(); // reputation 0
        
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(contractRepository.findByUserIdAndStatus(userId, ContractStatus.PENDING)).willReturn(Optional.empty());
        given(contractRepository.save(any(Contract.class))).willAnswer(invocation -> invocation.getArgument(0));

        // when
        ContractDto.Response response = contractService.generateContract(userId);

        // then
        assertThat(response.getStatus()).isEqualTo(ContractStatus.PENDING);
        assertThat(response.getTargetLevel()).isBetween(3, 5);
        assertThat(response.getRewardGold()).isGreaterThan(BigInteger.ZERO);
    }

    @Test
    @DisplayName("의뢰 완료 성공 테스트")
    void completeContractSuccess() {
        // given
        UUID userId = UUID.randomUUID();
        User user = User.builder().nickname("tester").build();
        
        Contract contract = Contract.builder()
                .user(user)
                .targetLevel(7)
                .rewardGold(BigInteger.valueOf(1000))
                .build();

        given(contractRepository.findByUserIdAndStatus(userId, ContractStatus.PENDING)).willReturn(Optional.of(contract));

        // when
        ContractDto.Response response = contractService.completeContract(userId, 7);

        // then
        assertThat(response.getStatus()).isEqualTo(ContractStatus.COMPLETED);
        assertThat(user.getGold()).isEqualTo(BigInteger.valueOf(1000));
    }
}
