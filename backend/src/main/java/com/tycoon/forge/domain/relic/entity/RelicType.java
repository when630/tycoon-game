package com.tycoon.forge.domain.relic.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RelicType {
    GOLDEN_HAMMER("Golden Hammer", "Enhance Success Rate +1%", 0.01),
    ANCIENT_ANVIL("Ancient Anvil", "Enhance Cost -5%", 0.05),
    MERCHANT_CERTIFICATE("Merchant Certificate", "Contract Reward +10%", 0.10),
    LUCKY_CLOVER("Lucky Clover", "Destroy Prevention Rate +2%", 0.02);

    private final String name;
    private final String description;
    private final double effectValue;
}
