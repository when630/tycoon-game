package com.tycoon.forge.domain.relic.entity;

import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserRelic extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private RelicType relicType;

    private int level;

    @Builder
    public UserRelic(User user, RelicType relicType, int level) {
        this.user = user;
        this.relicType = relicType;
        this.level = level;
    }

    public void levelUp() {
        this.level++;
    }
}
