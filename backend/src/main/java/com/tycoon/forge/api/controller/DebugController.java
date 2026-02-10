package com.tycoon.forge.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/debug")
@RequiredArgsConstructor
public class DebugController {

  private final Environment env;

  @GetMapping("/info")
  public ResponseEntity<Map<String, Object>> getDebugInfo() {
    Map<String, Object> info = new HashMap<>();
    info.put("activeProfiles", env.getActiveProfiles());
    info.put("datasourceUrl", env.getProperty("spring.datasource.url"));
    // Mask password
    return ResponseEntity.ok(info);
  }
}
