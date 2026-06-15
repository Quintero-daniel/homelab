package com.homelab.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    private Integer rating;

    private String pictureUrl;

    @JsonManagedReference("recipe-ingredients")
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    @JsonManagedReference("recipe-nutritional-factors")
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeNutritionalFactor> nutritionalFactors = new ArrayList<>();

    @JsonManagedReference("recipe-directions")
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    private List<Direction> directions = new ArrayList<>();

    public UUID getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }

    public List<RecipeIngredient> getIngredients() { return ingredients; }
    public void setIngredients(List<RecipeIngredient> ingredients) { this.ingredients = ingredients; }

    public List<RecipeNutritionalFactor> getNutritionalFactors() { return nutritionalFactors; }
    public void setNutritionalFactors(List<RecipeNutritionalFactor> nutritionalFactors) { this.nutritionalFactors = nutritionalFactors; }

    public List<Direction> getDirections() { return directions; }
    public void setDirections(List<Direction> directions) { this.directions = directions; }
}
