package com.tycoon.forge.domain.contract.service;

import com.tycoon.forge.domain.contract.dto.ContractDto;
import com.tycoon.forge.domain.contract.repository.ContractRepository;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class ContractServiceIntegrationTest {

    @Autowired
    private ContractService contractService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Test
    @DisplayName("의뢰 목록 생성 반복 통합 테스트")
    void generateAvailableContractsRepeatTest() {
        // given
        User user = User.builder()
                .nickname("repeatUser")
                .provider("TEST")
                .providerId("test-id-repeat")
                .build();
        userRepository.save(user);

        for (int i = 0; i < 100; i++) {
            System.out.println("Iteration: " + i);
            List<ContractDto.Response> contracts = contractService.generateAvailableContracts(user.getId());
            assertThat(contracts).hasSize(3);
        }
    }
}
