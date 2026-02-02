package com.tycoon.forge.domain.user.repository;

import com.tycoon.forge.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    
    // Top 10 users by highest level
    List<User> findTop10ByOrderByHighestLevelDesc();
    
    // Top 10 users by gold
    List<User> findTop10ByOrderByGoldDesc();
}
