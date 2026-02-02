package com.tycoon.forge.domain.relic.controller;

import com.tycoon.forge.domain.relic.dto.RelicDto;
import com.tycoon.forge.domain.relic.service.RelicService;
import com.tycoon.forge.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/relic")
@RequiredArgsConstructor
public class RelicController {

    private final RelicService relicService;

    @PostMapping("/gacha")
    public ResponseEntity<RelicDto.Response> gachaRelic(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(relicService.gachaRelic(userPrincipal.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RelicDto.Response>> getUserRelics(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(relicService.getUserRelics(userPrincipal.getId()));
    }
}
