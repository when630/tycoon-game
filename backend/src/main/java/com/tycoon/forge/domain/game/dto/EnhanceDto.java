package com.tycoon.forge.domain.game.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

public class EnhanceDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private BigInteger itemBaseValue; // 아이템 기본 가치
        private int currentLevel; // 현재 강화 단계
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Result result; // SUCCESS, FAIL, DESTROY
        private int newLevel;
        private BigInteger goldChange;
        private int reputationChange;
        private String message;
    }

    public enum Result {
        SUCCESS, FAIL, DESTROY
    }
}
