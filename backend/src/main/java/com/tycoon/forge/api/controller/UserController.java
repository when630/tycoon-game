package com.tycoon.forge.api.controller;

import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import com.tycoon.forge.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigInteger;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    public ResponseEntity<User> getMyInfo(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
    }

    @PostMapping("/test/gold")
    public ResponseEntity<User> addTestGold(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setGold(user.getGold().add(BigInteger.valueOf(10000)));
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
}
