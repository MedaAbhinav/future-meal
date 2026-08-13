package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.request.FoodItemRequest;
import com.futuremeal.dto.request.RestaurantRequest;
import com.futuremeal.dto.response.*;
import com.futuremeal.entity.Restaurant;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.OrderStatus;
import com.futuremeal.repository.OrderRepository;
import com.futuremeal.security.SecurityUtils;
import com.futuremeal.service.impl.FoodItemServiceImpl;
import com.futuremeal.service.impl.OrderServiceImpl;
import com.futuremeal.service.impl.RestaurantServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasAnyRole('RESTAURANT_OWNER','ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Restaurant Owner", description = "Restaurant owner dashboard APIs")
public class OwnerController {

    private final RestaurantServiceImpl restaurantService;
    private final FoodItemServiceImpl foodItemService;
    private final OrderServiceImpl orderService;
    private final SecurityUtils securityUtils;
    private final OrderRepository orderRepository;

    // ── Restaurant ────────────────────────────────────────────────────────────

    @GetMapping("/restaurant")
    @Operation(summary = "Get owner's restaurant")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getMyRestaurant() {
        User owner = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getMyRestaurant(owner)));
    }

    @PostMapping("/restaurant")
    @Operation(summary = "Register a new restaurant")
    public ResponseEntity<ApiResponse<RestaurantResponse>> createRestaurant(
            @Valid @RequestBody RestaurantRequest req) {
        User owner = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        restaurantService.createRestaurant(req, owner), "Restaurant registered. Pending approval."));
    }

    @PutMapping("/restaurant/{id}")
    @Operation(summary = "Update restaurant details")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateRestaurant(
            @PathVariable Long id, @Valid @RequestBody RestaurantRequest req) {
        User owner = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                restaurantService.updateRestaurant(id, req, owner)));
    }

    @PatchMapping("/restaurant/{id}/status")
    @Operation(summary = "Toggle restaurant open/closed status")
    public ResponseEntity<ApiResponse<RestaurantResponse>> toggleStatus(
            @PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        User owner = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                restaurantService.toggleStatus(id, body.get("isOpen"), owner)));
    }

    @GetMapping("/restaurant/stats")
    @Operation(summary = "Get restaurant analytics summary")
    public ResponseEntity<ApiResponse<RestaurantStatsResponse>> getStats() {
        User owner = securityUtils.getCurrentUser();
        RestaurantResponse restaurant = restaurantService.getMyRestaurant(owner);
        Restaurant entity = restaurantService.findById(restaurant.getId());

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        RestaurantStatsResponse stats = RestaurantStatsResponse.builder()
                .todayOrders(orderRepository.countTodayByRestaurant(entity, startOfDay))
                .todayRevenue(nullSafe(orderRepository.sumTodayRevenueByRestaurant(entity, startOfDay)))
                .totalOrders(orderRepository.countByRestaurant(entity))
                .totalRevenue(nullSafe(orderRepository.sumRevenueByRestaurant(entity)))
                .averageRating(restaurant.getRating())
                .activeOrders(orderRepository.countActiveByRestaurant(entity))
                .popularItems(List.of())
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ── Food Items ────────────────────────────────────────────────────────────

    @PostMapping("/foods")
    @Operation(summary = "Add a food item to the menu")
    public ResponseEntity<ApiResponse<FoodItemResponse>> createFood(
            @Valid @RequestBody FoodItemRequest req) {
        User owner = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(foodItemService.create(req, owner), "Food item added"));
    }

    @PutMapping("/foods/{id}")
    @Operation(summary = "Update a food item")
    public ResponseEntity<ApiResponse<FoodItemResponse>> updateFood(
            @PathVariable Long id, @Valid @RequestBody FoodItemRequest req) {
        User owner = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(foodItemService.update(id, req, owner)));
    }

    @DeleteMapping("/foods/{id}")
    @Operation(summary = "Delete a food item from the menu")
    public ResponseEntity<ApiResponse<Void>> deleteFood(@PathVariable Long id) {
        User owner = securityUtils.getCurrentUser();
        foodItemService.delete(id, owner);
        return ResponseEntity.ok(ApiResponse.success(null, "Food item deleted"));
    }

    @PatchMapping("/foods/{id}/availability")
    @Operation(summary = "Toggle food item availability")
    public ResponseEntity<ApiResponse<FoodItemResponse>> toggleAvailability(
            @PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        User owner = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                foodItemService.toggleAvailability(id, body.get("isAvailable"), owner)));
    }

    // ── Orders ────────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    @Operation(summary = "Get restaurant orders with optional status filter")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            @RequestParam(required = false) String status) {
        User owner = securityUtils.getCurrentUser();
        RestaurantResponse restaurant = restaurantService.getMyRestaurant(owner);
        Restaurant entity = restaurantService.findById(restaurant.getId());
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getRestaurantOrders(entity, status)));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        User owner = securityUtils.getCurrentUser();
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateStatus(id, status, owner)));
    }

    private double nullSafe(Double val) {
        return val != null ? val : 0.0;
    }
}
