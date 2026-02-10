package com.tycoon.forge.api.controller;

import com.tycoon.forge.domain.game.service.GameService;
import com.tycoon.forge.domain.game.dto.EnhanceDto;
import com.tycoon.forge.global.security.UserPrincipal;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigInteger;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final com.tycoon.forge.domain.game.service.EnhanceService enhanceService;

    @PostMapping("/sell")
    public ResponseEntity<Map<String, Object>> sellItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody SellRequest request) {

        BigInteger reward = gameService.sellItem(userPrincipal.getId(), request.getCurrentLevel(),
                request.getItemBaseValue());

        return ResponseEntity.ok(Map.of(
                "message", "판매 완료! " + reward + " G 획득.",
                "reward", reward,
                "goldChange", reward));
    }

    @Data
    public static class SellRequest {
        private int currentLevel;
        private BigInteger itemBaseValue;
    }

    @GetMapping("/probability")
    public ResponseEntity<EnhanceDto.ProbabilityResponse> getProbability(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam int level) {
        return ResponseEntity.ok(enhanceService.getProbabilities(userPrincipal.getId(), level));
    }
}
