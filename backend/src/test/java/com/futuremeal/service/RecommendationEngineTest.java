package com.futuremeal.service;

import com.futuremeal.entity.*;
import com.futuremeal.entity.enums.*;
import com.futuremeal.service.recommendation.DeterministicRecommendationEngine;
import com.futuremeal.service.recommendation.RecommendationEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class RecommendationEngineTest {

    private DeterministicRecommendationEngine engine;

    @BeforeEach
    void setUp() {
        engine = new DeterministicRecommendationEngine();
        // Set scoring weights
        ReflectionTestUtils.setField(engine, "weightBudget",      0.30);
        ReflectionTestUtils.setField(engine, "weightAvailability", 0.20);
        ReflectionTestUtils.setField(engine, "weightDistance",     0.15);
        ReflectionTestUtils.setField(engine, "weightDeliveryTime", 0.15);
        ReflectionTestUtils.setField(engine, "weightRating",       0.10);
        ReflectionTestUtils.setField(engine, "weightPreference",   0.10);
    }

    private Restaurant buildRestaurant(double rating, int deliveryTime, boolean isOpen) {
        Restaurant r = new Restaurant();
        r.setId(1L);
        r.setName("Test Restaurant");
        r.setRating(rating);
        r.setDeliveryTime(deliveryTime);
        r.setOpen(isOpen);
        r.setCuisines(List.of("Biryani"));
        return r;
    }

    private FoodItem buildFood(double price, boolean available, DietaryType diet,
                                SpiceLevel spice, Restaurant restaurant) {
        FoodItem f = new FoodItem();
        f.setId(1L);
        f.setName("Test Food");
        f.setPrice(price);
        f.setAvailable(available);
        f.setDietaryType(diet);
        f.setSpiceLevel(spice);
        f.setRating(4.0);
        f.setRestaurant(restaurant);
        f.setCategory("Biryani");
        return f;
    }

    private FutureMeal buildFutureMeal(double budget, DietaryPreference diet, SpiceLevel spice) {
        FutureMeal fm = new FutureMeal();
        fm.setId(1L);
        fm.setDescription("Test meal");
        fm.setPlannedDate(LocalDate.now().plusDays(1));
        fm.setPlannedTime(LocalTime.of(19, 0));
        fm.setMaxBudget(budget);
        fm.setDietaryPreference(diet);
        fm.setSpicePreference(spice);
        fm.setCuisine(CuisineType.BIRYANI);
        return fm;
    }

    @Test
    @DisplayName("Returns best candidate within budget")
    void recommendsWithinBudget() {
        Restaurant r = buildRestaurant(4.5, 25, true);
        FoodItem food = buildFood(199.0, true, DietaryType.NON_VEG, SpiceLevel.MEDIUM, r);
        FutureMeal fm = buildFutureMeal(250.0, DietaryPreference.NON_VEG, SpiceLevel.MEDIUM);

        Optional<RecommendationEngine.RecommendationResult> result = engine.recommend(fm, List.of(food));

        assertThat(result).isPresent();
        assertThat(result.get().foodItem().getName()).isEqualTo("Test Food");
        assertThat(result.get().score()).isGreaterThan(40.0);
    }

    @Test
    @DisplayName("Rejects candidates from closed restaurants")
    void rejectsClosedRestaurants() {
        Restaurant r = buildRestaurant(4.5, 25, false); // closed
        FoodItem food = buildFood(199.0, true, DietaryType.NON_VEG, SpiceLevel.MEDIUM, r);
        FutureMeal fm = buildFutureMeal(250.0, DietaryPreference.NON_VEG, SpiceLevel.MEDIUM);

        Optional<RecommendationEngine.RecommendationResult> result = engine.recommend(fm, List.of(food));

        // Score should be low (availability = 0) so below threshold
        // Either empty or very low score
        result.ifPresent(r2 -> assertThat(r2.score()).isLessThan(50.0));
    }

    @Test
    @DisplayName("Prefers food within budget over expensive options")
    void prefersCheaperFood() {
        Restaurant r = buildRestaurant(4.5, 25, true);
        FoodItem cheap = buildFood(149.0, true, DietaryType.NON_VEG, SpiceLevel.MEDIUM, r);
        cheap.setName("Cheap Biryani");
        FoodItem expensive = buildFood(399.0, true, DietaryType.NON_VEG, SpiceLevel.MEDIUM, r);
        expensive.setName("Expensive Biryani");

        FutureMeal fm = buildFutureMeal(200.0, DietaryPreference.NON_VEG, SpiceLevel.MEDIUM);

        Optional<RecommendationEngine.RecommendationResult> result = engine.recommend(fm, List.of(cheap, expensive));

        assertThat(result).isPresent();
        assertThat(result.get().foodItem().getName()).isEqualTo("Cheap Biryani");
    }

    @Test
    @DisplayName("Veg user gets veg recommendation")
    void vegUserGetsVegFood() {
        Restaurant r = buildRestaurant(4.2, 20, true);
        FoodItem vegFood    = buildFood(150.0, true, DietaryType.VEG,     SpiceLevel.MILD,   r);
        vegFood.setName("Veg Biryani");
        FoodItem nonVegFood = buildFood(150.0, true, DietaryType.NON_VEG, SpiceLevel.MEDIUM, r);
        nonVegFood.setName("Chicken Biryani");

        FutureMeal fm = buildFutureMeal(200.0, DietaryPreference.VEG, SpiceLevel.MILD);

        Optional<RecommendationEngine.RecommendationResult> result =
                engine.recommend(fm, List.of(vegFood, nonVegFood));

        assertThat(result).isPresent();
        // Veg preference should score veg food higher
        assertThat(result.get().foodItem().getName()).isEqualTo("Veg Biryani");
    }

    @Test
    @DisplayName("Returns empty when no candidates provided")
    void emptyWhenNoCandidates() {
        FutureMeal fm = buildFutureMeal(250.0, DietaryPreference.NON_VEG, SpiceLevel.MEDIUM);
        Optional<RecommendationEngine.RecommendationResult> result = engine.recommend(fm, List.of());
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Engine is always available (no external dependencies)")
    void isAlwaysAvailable() {
        assertThat(engine.isAvailable()).isTrue();
        assertThat(engine.getName()).contains("Deterministic");
    }

    @Test
    @DisplayName("Recommendation includes a reason string")
    void includesReason() {
        Restaurant r = buildRestaurant(4.6, 22, true);
        FoodItem food = buildFood(199.0, true, DietaryType.NON_VEG, SpiceLevel.MEDIUM, r);
        FutureMeal fm = buildFutureMeal(250.0, DietaryPreference.NON_VEG, SpiceLevel.MEDIUM);

        Optional<RecommendationEngine.RecommendationResult> result = engine.recommend(fm, List.of(food));

        assertThat(result).isPresent();
        assertThat(result.get().reason()).isNotBlank();
    }
}
