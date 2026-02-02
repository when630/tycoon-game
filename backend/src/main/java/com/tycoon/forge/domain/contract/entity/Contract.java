package com.tycoon.forge.domain.contract.entity;

import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contract extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private int targetLevel;

    private BigInteger rewardGold;

    private BigInteger penaltyGold;

    private LocalDateTime timeLimit; // Optional

    @Enumerated(EnumType.STRING)
    private ContractStatus status;

    @Builder
    public Contract(User user, int targetLevel, BigInteger rewardGold, BigInteger penaltyGold, LocalDateTime timeLimit) {
        this.user = user;
        this.targetLevel = targetLevel;
        this.rewardGold = rewardGold;
        this.penaltyGold = penaltyGold;
        this.timeLimit = timeLimit;
        this.status = ContractStatus.PENDING;
    }

    public void complete() {
        this.status = ContractStatus.COMPLETED;
    }

    public void fail() {
        this.status = ContractStatus.FAILED;
    }
}
