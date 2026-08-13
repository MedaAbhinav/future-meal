package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.response.FoodItemResponse;
import com.futuremeal.service.impl.FoodItemServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
@Tag(name = "Foods", description = "Browse food items")
public class FoodController {

    private final FoodItemServiceImpl foodItemService;

    @GetMapping
    @Operation(summary = "Get all available foods with optional filters")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getAll(
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String city) {
        if (cuisine != null && !cuisine.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(foodItemService.getByCuisine(cuisine)));
        }
        return ResponseEntity.ok(ApiResponse.success(foodItemService.getPopular()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get food item details")
    public ResponseEntity<ApiResponse<FoodItemResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(foodItemService.getById(id)));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular/bestseller food items")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getPopular() {
        return ResponseEntity.ok(ApiResponse.success(foodItemService.getPopular()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search food items by name or description")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> search(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(foodItemService.search(query)));
    }

    @GetMapping("/cuisine")
    @Operation(summary = "Get foods by cuisine type")
    public ResponseEntity<ApiResponse<List<FoodItemResponse>>> getByCuisine(
            @RequestParam String cuisine) {
        return ResponseEntity.ok(ApiResponse.success(foodItemService.getByCuisine(cuisine)));
    }
}
