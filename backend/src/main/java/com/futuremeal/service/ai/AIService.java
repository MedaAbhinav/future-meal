package com.futuremeal.service.ai;

import com.futuremeal.entity.FutureMeal;
import com.futuremeal.entity.FoodItem;

import java.util.List;
import java.util.Optional;

/**
 * AI service abstraction.
 * When an AI provider is configured (OpenAI, Gemini, etc.),
 * replace NoOpAIService with a real implementation.
 *
 * Configure via environment variables:
 *   AI_ENABLED=true
 *   AI_PROVIDER=openai
 *   AI_API_KEY=sk-...
 *   AI_MODEL=gpt-4o-mini
 */
public interface AIService {

    /**
     * Ask the AI to rank candidates and pick the best for this FutureMeal.
     */
    Optional<AIRecommendationResult> generateMealRecommendation(
            FutureMeal futureMeal, List<FoodItem> candidates);

    /**
     * Generate a natural-language explanation for why a food item was recommended.
     */
    String explainRecommendation(FutureMeal futureMeal, FoodItem recommended);

    /**
     * Parse a free-text FutureMeal intent into structured fields.
     * e.g. "biryani after my exam Friday under ₹250" → structured request
     */
    Optional<ParsedMealIntent> parseFutureMealIntent(String naturalLanguageInput);

    /** Whether the AI service is configured and operational. */
    boolean isEnabled();

    record AIRecommendationResult(
            FoodItem foodItem,
            double score,
            String explanation
    ) {}

    record ParsedMealIntent(
            String description,
            String suggestedCuisine,
            String suggestedDietaryPreference,
            Double suggestedBudget,
            String suggestedTime,
            String specialConditions
    ) {}
}
