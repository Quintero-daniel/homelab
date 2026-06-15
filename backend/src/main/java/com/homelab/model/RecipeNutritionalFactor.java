package com.homelab.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "recipe_nutritional_factors")
public class RecipeNutritionalFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonBackReference("recipe-nutritional-factors")
    @ManyToOne
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "nutritional_factor_id", nullable = false)
    private NutritionalFactor nutritionalFactor;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String unit;

    public UUID getId() { return id; }

    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }

    public NutritionalFactor getNutritionalFactor() { return nutritionalFactor; }
    public void setNutritionalFactor(NutritionalFactor nutritionalFactor) { this.nutritionalFactor = nutritionalFactor; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}
