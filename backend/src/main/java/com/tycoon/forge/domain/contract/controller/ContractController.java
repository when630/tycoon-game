package com.tycoon.forge.domain.contract.controller;

import com.tycoon.forge.domain.contract.dto.ContractDto;
import com.tycoon.forge.domain.contract.service.ContractService;
import com.tycoon.forge.domain.contract.entity.WeaponType;
import com.tycoon.forge.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contract")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping("/available/generate")
    public ResponseEntity<List<ContractDto.Response>> generateAvailableContracts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new IllegalArgumentException("인증 정보가 없습니다.");
        }
        return ResponseEntity.ok(contractService.generateAvailableContracts(userPrincipal.getId()));
    }

    @GetMapping("/available")
    public ResponseEntity<List<ContractDto.Response>> getAvailableContracts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(contractService.getAvailableContracts(userPrincipal.getId()));
    }

    @PostMapping("/accept/{contractId}")
    public ResponseEntity<ContractDto.Response> acceptContract(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long contractId,
            @RequestBody Map<String, String> request) {
        String weaponTypeStr = request.get("weaponType");
        WeaponType weaponType = WeaponType.SWORD; // Default
        if (weaponTypeStr != null) {
            try {
                weaponType = WeaponType.valueOf(weaponTypeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid type and use default or throw?
                // Let's use default for now or maybe throw exception to inform user.
                throw new IllegalArgumentException("유효하지 않은 무기 종류입니다.");
            }
        }
        return ResponseEntity.ok(contractService.acceptContract(userPrincipal.getId(), contractId, weaponType));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ContractDto.Response>> getActiveContracts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(contractService.getActiveContracts(userPrincipal.getId()));
    }

    @PostMapping("/complete/{contractId}")
    public ResponseEntity<ContractDto.Response> completeContract(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long contractId,
            @RequestBody Map<String, Integer> request) {

        int itemLevel = request.getOrDefault("itemLevel", 0);
        return ResponseEntity.ok(contractService.completeContract(userPrincipal.getId(), contractId, itemLevel));
    }

    @PostMapping("/cancel/{contractId}")
    public ResponseEntity<ContractDto.Response> cancelContract(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.cancelContract(userPrincipal.getId(), contractId));
    }
}
