package com.homelab.service;

import com.homelab.model.*;
import com.homelab.repository.IngredientRepository;
import com.homelab.repository.NutritionalFactorRepository;
import com.homelab.repository.RecipeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final NutritionalFactorRepository nutritionalFactorRepository;

    public RecipeService(RecipeRepository recipeRepository,
                         IngredientRepository ingredientRepository,
                         NutritionalFactorRepository nutritionalFactorRepository) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.nutritionalFactorRepository = nutritionalFactorRepository;
    }

    @Transactional(readOnly = true)
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Recipe getRecipeById(UUID id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Recipe not found with id: " + id));
    }

    public Recipe createRecipe(Recipe recipe) {
        resolveIngredients(recipe);
        resolveNutritionalFactors(recipe);
        return recipeRepository.save(recipe);
    }

    public Recipe updateRecipe(UUID id, Recipe updated) {
        // Resolve references before loading the managed entity to avoid
        // TransientObjectException during Hibernate auto-flush.
        resolveIngredients(updated);
        resolveNutritionalFactors(updated);

        Recipe existing = getRecipeById(id);

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setRating(updated.getRating());
        existing.setPictureUrl(updated.getPictureUrl());

        existing.getIngredients().clear();
        existing.getIngredients().addAll(updated.getIngredients());
        existing.getIngredients().forEach(ri -> ri.setRecipe(existing));

        existing.getNutritionalFactors().clear();
        existing.getNutritionalFactors().addAll(updated.getNutritionalFactors());
        existing.getNutritionalFactors().forEach(rnf -> rnf.setRecipe(existing));

        existing.getDirections().clear();
        existing.getDirections().addAll(updated.getDirections());
        existing.getDirections().forEach(d -> d.setRecipe(existing));

        return recipeRepository.save(existing);
    }

    public void deleteRecipe(UUID id) {
        if (!recipeRepository.existsById(id)) {
            throw new EntityNotFoundException("Recipe not found with id: " + id);
        }
        recipeRepository.deleteById(id);
    }

    private void resolveIngredients(Recipe recipe) {
        recipe.getIngredients().forEach(ri -> {
            String name = ri.getIngredient().getName();
            Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> ingredientRepository.save(ri.getIngredient()));
            ri.setIngredient(ingredient);
            ri.setRecipe(recipe);
        });
    }

    private void resolveNutritionalFactors(Recipe recipe) {
        recipe.getNutritionalFactors().forEach(rnf -> {
            String name = rnf.getNutritionalFactor().getName();
            NutritionalFactor factor = nutritionalFactorRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> nutritionalFactorRepository.save(rnf.getNutritionalFactor()));
            rnf.setNutritionalFactor(factor);
            rnf.setRecipe(recipe);
        });
    }
}
