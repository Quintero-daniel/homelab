package com.homelab.repository;

import com.homelab.model.NutritionalFactor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface NutritionalFactorRepository extends JpaRepository<NutritionalFactor, UUID> {

    Optional<NutritionalFactor> findByNameIgnoreCase(String name);
}
