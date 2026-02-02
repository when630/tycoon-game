package com.tycoon.forge.api.controller;

import com.tycoon.forge.domain.game.dto.EnhanceDto;
import com.tycoon.forge.domain.game.service.EnhanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/game")
@RequiredArgsConstructor
public class EnhanceController {

    private final EnhanceService enhanceService;

    @PostMapping("/enhance")
    public ResponseEntity<EnhanceDto.Response> enhance(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody EnhanceDto.Request request) {
        
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(enhanceService.enhance(userId, request));
    }
}
