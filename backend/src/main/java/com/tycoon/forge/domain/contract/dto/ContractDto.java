package com.tycoon.forge.domain.contract.dto;

import com.tycoon.forge.domain.contract.entity.Contract;
import com.tycoon.forge.domain.contract.entity.ContractStatus;
import com.tycoon.forge.domain.contract.entity.WeaponType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigInteger;
import java.time.LocalDateTime;

public class ContractDto {

    @Getter
    @Builder
    public static class Response {
        private Long id;
        private int targetLevel;
        private BigInteger rewardGold;
        private BigInteger penaltyGold;
        private LocalDateTime timeLimit;
        private ContractStatus status;
        private WeaponType weaponType;

        public static Response from(Contract contract) {
            return Response.builder()
                    .id(contract.getId())
                    .targetLevel(contract.getTargetLevel())
                    .rewardGold(contract.getRewardGold())
                    .penaltyGold(contract.getPenaltyGold())
                    .timeLimit(contract.getTimeLimit())
                    .status(contract.getStatus())
                    .weaponType(contract.getWeaponType())
                    .build();
        }
    }
}
