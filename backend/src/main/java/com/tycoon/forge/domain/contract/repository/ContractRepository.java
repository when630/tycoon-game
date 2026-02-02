package com.tycoon.forge.domain.contract.repository;

import com.tycoon.forge.domain.contract.entity.Contract;
import com.tycoon.forge.domain.contract.entity.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByUserIdAndStatus(UUID userId, ContractStatus status);
}
