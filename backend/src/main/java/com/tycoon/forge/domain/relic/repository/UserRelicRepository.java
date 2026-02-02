package com.tycoon.forge.domain.relic.repository;

import com.tycoon.forge.domain.relic.entity.RelicType;
import com.tycoon.forge.domain.relic.entity.UserRelic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRelicRepository extends JpaRepository<UserRelic, Long> {
    List<UserRelic> findAllByUserId(UUID userId);
    Optional<UserRelic> findByUserIdAndRelicType(UUID userId, RelicType relicType);
}
