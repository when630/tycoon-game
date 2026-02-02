package com.tycoon.forge.domain.relic.dto;

import com.tycoon.forge.domain.relic.entity.RelicType;
import com.tycoon.forge.domain.relic.entity.UserRelic;
import lombok.Builder;
import lombok.Getter;

public class RelicDto {

    @Getter
    @Builder
    public static class Response {
        private Long id;
        private RelicType relicType;
        private String name;
        private String description;
        private int level;
        private double currentEffect;

        public static Response from(UserRelic userRelic) {
            return Response.builder()
                    .id(userRelic.getId())
                    .relicType(userRelic.getRelicType())
                    .name(userRelic.getRelicType().getName())
                    .description(userRelic.getRelicType().getDescription())
                    .level(userRelic.getLevel())
                    .currentEffect(userRelic.getRelicType().getEffectValue() * userRelic.getLevel())
                    .build();
        }
    }
}
