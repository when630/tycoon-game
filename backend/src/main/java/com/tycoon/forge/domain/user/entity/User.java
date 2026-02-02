package com.tycoon.forge.domain.user.entity;

import com.tycoon.forge.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(nullable = false)
    private BigInteger gold;

    @Column(nullable = false)
    private int reputation;

    @Column(name = "highest_level", nullable = false)
    private int highestLevel;

    @Column(length = 20)
    private String provider; // KAKAO, GOOGLE, etc.

    @Column(name = "provider_id")
    private String providerId;

    @Builder
    public User(String nickname, String provider, String providerId) {
        this.nickname = nickname;
        this.gold = BigInteger.ZERO;
        this.reputation = 0;
        this.highestLevel = 0;
        this.provider = provider;
        this.providerId = providerId;
    }

    public void updateGold(BigInteger amount) {
        this.gold = amount;
    }
    
    public void addGold(BigInteger amount) {
        this.gold = this.gold.add(amount);
    }
    
    public void subtractGold(BigInteger amount) {
       // TODO: Check for negative balance if needed
       this.gold = this.gold.subtract(amount);
    }

    public void updateReputation(int amount) {
        this.reputation += amount;
    }

    public void decreaseReputation(int amount) {
        this.reputation -= amount;
    }
    
    public void updateHighestLevel(int level) {
        if (level > this.highestLevel) {
            this.highestLevel = level;
        }
    }
}
