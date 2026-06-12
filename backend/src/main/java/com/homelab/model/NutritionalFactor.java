package com.homelab.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "nutritional_factors")
public class NutritionalFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    public UUID getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
