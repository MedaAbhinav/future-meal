package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.response.FoodItemResponse;
import com.futuremeal.dto.response.RestaurantResponse;
import com.futuremeal.service.impl.FoodItemServiceImpl;
import com.futuremeal.service.impl.RestaurantServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Tag(name = "Restaurants", description = "Browse and discover restaurants")
public class RestaurantController {

    private final RestaurantServiceImpl restaurantService;
    private final FoodItemServiceImpl foodItemService;

    @GetMapping
    @Operation(summary = "List all active restaurants with optional filters")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(ApiResponse.success(
                restaurantService.getAllActive(city, cuisine, sortBy)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get restaurant details by ID")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getById(id)));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured/top-rated restaurants")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getFeatured()));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get restaurants near a city")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getNearby(
            @RequestParam String city) {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getNearby(city)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search restaurants by name or cuisine")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> search(
            @RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.search(query)));
    }

    @GetMapping("/{id}/foods")
    @Operation(summary = "Get all food items for a restaurant")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getFoods(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(foodItemService.getAllByRestaurant(id)));
    }

    @GetMapping("/{id}/menu")
    @Operation(summary = "Get restaurant menu grouped by category")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getMenu(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(foodItemService.getByRestaurant(id)));
    }
}
