package com.tycoon.forge.domain.user.service;

import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import com.tycoon.forge.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public String login(String nickname) {
        // Find existing user or create a new one (simple logic for dev)
        // In real social login, we would check providerId
        User user = userRepository.findAll().stream()
                .filter(u -> u.getNickname().equals(nickname))
                .findFirst()
                .orElseGet(() -> userRepository.save(User.builder().nickname(nickname).build()));

        return jwtTokenProvider.createToken(user.getId());
    }
}
