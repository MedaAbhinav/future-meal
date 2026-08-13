package com.futuremeal.service.ai;

import com.futuremeal.entity.FoodItem;
import com.futuremeal.entity.FutureMeal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * No-op implementation used when AI is not configured.
 * The application works fully without an AI API key.
 * To enable AI: set AI_ENABLED=true and AI_API_KEY in environment.
 */
@Service
@ConditionalOnProperty(name = "app.ai.enabled", havingValue = "false", matchIfMissing = true)
@Slf4j
public class NoOpAIService implements AIService {

    @Override
    public Optional<AIRecommendationResult> generateMealRecommendation(
            FutureMeal futureMeal, List<FoodItem> candidates) {
        log.debug("AI service not configured. Using deterministic engine.");
        return Optional.empty();
    }

    @Override
    public String explainRecommendation(FutureMeal futureMeal, FoodItem recommended) {
        return "Recommended based on your preferences and availability.";
    }

    @Override
    public Optional<ParsedMealIntent> parseFutureMealIntent(String naturalLanguageInput) {
        log.debug("AI intent parsing not configured.");
        return Optional.empty();
    }

    @Override
    public boolean isEnabled() {
        return false;
    }
}
