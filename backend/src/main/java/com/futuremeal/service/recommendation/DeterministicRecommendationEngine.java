package com.futuremeal.service.recommendation;

import com.futuremeal.entity.FoodItem;
import com.futuremeal.entity.FutureMeal;
import com.futuremeal.entity.Restaurant;
import com.futuremeal.entity.enums.CuisineType;
import com.futuremeal.entity.enums.DietaryPreference;
import com.futuremeal.entity.enums.DietaryType;
import com.futuremeal.entity.enums.SpiceLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Deterministic scoring-based recommendation engine.
 *
 * Scoring formula (configurable weights):
 *   budgetMatch    30% — how well the price fits within budget
 *   availability   20% — restaurant is open and food is available
 *   distance       15% — estimated by rating as proxy (no GPS in demo)
 *   deliveryTime   15% — faster delivery scores higher
 *   rating         10% — restaurant + food rating
 *   preferenceMatch 10% — dietary, spice, cuisine alignment
 *
 * All scores normalised to 0..100.
 */
@Component
@Slf4j
public class DeterministicRecommendationEngine implements RecommendationEngine {

    @Value("${app.futuremeal.score-weights.budget-match:0.30}")
    private double weightBudget;

    @Value("${app.futuremeal.score-weights.availability:0.20}")
    private double weightAvailability;

    @Value("${app.futuremeal.score-weights.distance:0.15}")
    private double weightDistance;

    @Value("${app.futuremeal.score-weights.delivery-time:0.15}")
    private double weightDeliveryTime;

    @Value("${app.futuremeal.score-weights.rating:0.10}")
    private double weightRating;

    @Value("${app.futuremeal.score-weights.preference-match:0.10}")
    private double weightPreference;

    @Override
    public Optional<RecommendationResult> recommend(FutureMeal futureMeal, List<FoodItem> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            log.debug("No candidates for FutureMeal {}", futureMeal.getId());
            return Optional.empty();
        }

        RecommendationResult best = null;
        double bestScore = -1;

        for (FoodItem food : candidates) {
            double score = computeScore(futureMeal, food);
            log.debug("FutureMeal {} | Food '{}' | Score: {}", futureMeal.getId(), food.getName(), score);
            if (score > bestScore) {
                bestScore = score;
                best = new RecommendationResult(
                        food,
                        food.getRestaurant(),
                        Math.round(score * 100.0) / 100.0,
                        buildReason(futureMeal, food, score),
                        false
                );
            }
        }

        // Minimum quality threshold — only recommend if score >= 40
        if (best != null && bestScore >= 40.0) {
            log.info("FutureMeal {} best match: '{}' at score {}", futureMeal.getId(), best.foodItem().getName(), bestScore);
            return Optional.of(best);
        }

        return Optional.empty();
    }

    @Override
    public boolean isAvailable() {
        return true; // Always available — no external dependency
    }

    @Override
    public String getName() {
        return "DeterministicRecommendationEngine v1";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scoring components
    // ─────────────────────────────────────────────────────────────────────────

    private double computeScore(FutureMeal fm, FoodItem food) {
        double budget     = scoreBudget(fm.getMaxBudget(), food.getPrice())         * weightBudget     * 100;
        double avail      = scoreAvailability(food)                                  * weightAvailability * 100;
        double distance   = scoreDistance(food.getRestaurant())                      * weightDistance   * 100;
        double delivery   = scoreDeliveryTime(food.getRestaurant().getDeliveryTime()) * weightDeliveryTime * 100;
        double rating     = scoreRating(food)                                        * weightRating     * 100;
        double preference = scorePreferences(fm, food)                               * weightPreference * 100;

        return budget + avail + distance + delivery + rating + preference;
    }

    /**
     * Budget match: 1.0 if price ≤ 80% of budget, degrades to 0 at 120% of budget.
     */
    private double scoreBudget(double maxBudget, double price) {
        if (price <= maxBudget * 0.8) return 1.0;
        if (price <= maxBudget) return 0.8;
        if (price <= maxBudget * 1.1) return 0.4;
        if (price <= maxBudget * 1.2) return 0.1;
        return 0.0; // Over budget
    }

    /**
     * Availability: restaurant open + food available = 1.0, otherwise 0.
     */
    private double scoreAvailability(FoodItem food) {
        if (!food.isAvailable()) return 0.0;
        if (!food.getRestaurant().isOpen()) return 0.0;
        return 1.0;
    }

    /**
     * Distance proxy: use restaurant rating as a quality-of-area proxy.
     * Real GPS-based distance can be plugged in here.
     */
    private double scoreDistance(Restaurant restaurant) {
        // Higher rated restaurants tend to be better establishments.
        // Scale 3..5 → 0..1
        double rating = restaurant.getRating();
        if (rating <= 0) return 0.5;
        return Math.min(1.0, (rating - 2.0) / 3.0);
    }

    /**
     * Delivery time: 15 min → 1.0, 60 min → 0.0, linear.
     */
    private double scoreDeliveryTime(int deliveryMinutes) {
        if (deliveryMinutes <= 15) return 1.0;
        if (deliveryMinutes >= 60) return 0.0;
        return 1.0 - (deliveryMinutes - 15.0) / 45.0;
    }

    /**
     * Combined food + restaurant rating, normalised 0..5 → 0..1.
     */
    private double scoreRating(FoodItem food) {
        double foodRating = food.getRating();
        double restRating = food.getRestaurant().getRating();
        double combined = (foodRating + restRating) / 2.0;
        return combined / 5.0;
    }

    /**
     * Preference match: dietary type, spice level, cuisine alignment.
     */
    private double scorePreferences(FutureMeal fm, FoodItem food) {
        double score = 0.0;
        int factors = 3;

        // Dietary match
        score += matchesDietary(fm.getDietaryPreference(), food.getDietaryType()) ? 1.0 : 0.0;

        // Spice match
        score += matchesSpice(fm.getSpicePreference(), food.getSpiceLevel()) ? 1.0 : 0.5;

        // Cuisine match
        score += matchesCuisine(fm.getCuisine(), food) ? 1.0 : 0.3;

        // Preferred restaurant bonus
        if (fm.getPreferredRestaurant() != null
                && fm.getPreferredRestaurant().getId().equals(food.getRestaurant().getId())) {
            score += 1.0;
            factors++;
        }

        return score / factors;
    }

    private boolean matchesDietary(DietaryPreference pref, DietaryType type) {
        return switch (pref) {
            case VEG    -> type == DietaryType.VEG || type == DietaryType.VEGAN || type == DietaryType.JAIN;
            case VEGAN  -> type == DietaryType.VEGAN;
            case JAIN   -> type == DietaryType.JAIN;
            case NON_VEG -> true; // Non-veg users accept all types
        };
    }

    private boolean matchesSpice(SpiceLevel pref, SpiceLevel actual) {
        // Exact match or one level off
        int prefIdx = pref.ordinal();
        int actualIdx = actual.ordinal();
        return Math.abs(prefIdx - actualIdx) <= 1;
    }

    private boolean matchesCuisine(CuisineType cuisine, FoodItem food) {
        if (cuisine == CuisineType.ANY) return true;
        String cuisineStr = cuisine.name().replace("_", " ").toLowerCase();
        String category = food.getCategory().toLowerCase();
        String restCuisines = String.join(" ", food.getRestaurant().getCuisines()).toLowerCase();
        return category.contains(cuisineStr)
                || restCuisines.contains(cuisineStr)
                || cuisineStr.contains(category);
    }

    private String buildReason(FutureMeal fm, FoodItem food, double score) {
        List<String> reasons = new ArrayList<>();

        if (food.getPrice() <= fm.getMaxBudget()) {
            reasons.add(String.format("fits your budget of ₹%.0f", fm.getMaxBudget()));
        }
        if (food.getRestaurant().getRating() >= 4.0) {
            reasons.add(String.format("highly rated restaurant (%.1f★)", food.getRestaurant().getRating()));
        }
        if (food.getRestaurant().getDeliveryTime() <= 30) {
            reasons.add(String.format("fast delivery in ~%d min", food.getRestaurant().getDeliveryTime()));
        }
        if (food.isBestseller()) {
            reasons.add("bestseller item");
        }
        if (fm.getPreferredRestaurant() != null
                && fm.getPreferredRestaurant().getId().equals(food.getRestaurant().getId())) {
            reasons.add("from your preferred restaurant");
        }

        if (reasons.isEmpty()) {
            return String.format("Best available match with score %.1f", score);
        }
        return "This match " + String.join(", ", reasons) + ".";
    }
}
