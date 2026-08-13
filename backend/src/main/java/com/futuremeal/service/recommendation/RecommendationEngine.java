package com.futuremeal.service.recommendation;

import com.futuremeal.entity.FutureMeal;
import com.futuremeal.entity.FoodItem;
import com.futuremeal.entity.Restaurant;

import java.util.List;
import java.util.Optional;

/**
 * Strategy interface for FutureMeal recommendation engines.
 * Allows swapping between deterministic and AI-powered engines.
 */
public interface RecommendationEngine {

    /**
     * Find the best matching food item and restaurant for a FutureMeal.
     * @param futureMeal the planned meal
     * @param candidates list of available food items matching basic filters
     * @return the best recommendation, or empty if none qualifies
     */
    Optional<RecommendationResult> recommend(FutureMeal futureMeal, List<FoodItem> candidates);

    /**
     * Whether this engine is currently available/configured.
     */
    boolean isAvailable();

    /**
     * Human-readable name of the engine.
     */
    String getName();

    /**
     * Result container for a recommendation.
     */
    record RecommendationResult(
            FoodItem foodItem,
            Restaurant restaurant,
            double score,
            String reason,
            boolean isAIGenerated
    ) {}
}
