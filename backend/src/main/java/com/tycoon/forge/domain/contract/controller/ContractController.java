package com.tycoon.forge.domain.contract.controller;

import com.tycoon.forge.domain.contract.dto.ContractDto;
import com.tycoon.forge.domain.contract.service.ContractService;
import com.tycoon.forge.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/contract")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping("/new")
    public ResponseEntity<ContractDto.Response> generateContract(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(contractService.generateContract(userPrincipal.getId()));
    }

    @GetMapping("/current")
    public ResponseEntity<ContractDto.Response> getCurrentContract(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(contractService.getCurrentContract(userPrincipal.getId()));
    }

    @PostMapping("/complete")
    public ResponseEntity<ContractDto.Response> completeContract(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Integer> request) {
        
        int itemLevel = request.getOrDefault("itemLevel", 0);
        return ResponseEntity.ok(contractService.completeContract(userPrincipal.getId(), itemLevel));
    }
}
