package com.tycoon.forge.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tycoon.forge.domain.contract.entity.WeaponType;
import com.tycoon.forge.domain.user.entity.User;
import com.tycoon.forge.domain.user.repository.UserRepository;
import com.tycoon.forge.global.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GameControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private JwtTokenProvider jwtTokenProvider;

  private User testUser;
  private String token;

  @BeforeEach
  void setUp() {
    userRepository.deleteAll();

    testUser = User.builder()
        .nickname("testUser")
        .gold(BigInteger.valueOf(10000))
        .highestLevel(0)
        .reputation(0)
        .build();
    userRepository.save(testUser);

    token = jwtTokenProvider.createToken(testUser.getId());
  }

  @Test
  @DisplayName("무기 선택 테스트")
  void selectWeapon() throws Exception {
    // given
    GameController.WeaponSelectRequest request = new GameController.WeaponSelectRequest();
    request.setWeaponType(WeaponType.SWORD);

    // when & then
    mockMvc.perform(post("/api/v1/game/select-weapon")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andDo(print())
        .andExpect(status().isOk());
  }
}
