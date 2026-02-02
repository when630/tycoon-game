package com.tycoon.forge.api.controller;

import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rank")
@RequiredArgsConstructor
public class RankingController {

    private final UserRepository userRepository;

    @GetMapping("/level")
    public ResponseEntity<List<User>> getLevelRanking() {
        return ResponseEntity.ok(userRepository.findTop10ByOrderByHighestLevelDesc());
    }

    @GetMapping("/rich")
    public ResponseEntity<List<User>> getRichRanking() {
        return ResponseEntity.ok(userRepository.findTop10ByOrderByGoldDesc());
    }
}
