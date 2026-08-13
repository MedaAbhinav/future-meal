package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.PageResponse;
import com.futuremeal.dto.response.AdminStatsResponse;
import com.futuremeal.dto.response.FutureMealResponse;
import com.futuremeal.dto.response.RestaurantResponse;
import com.futuremeal.entity.enums.FutureMealStatus;
import com.futuremeal.entity.enums.RestaurantStatus;
import com.futuremeal.entity.enums.UserRole;
import com.futuremeal.exception.ResourceNotFoundException;
import com.futuremeal.repository.*;
import com.futuremeal.service.impl.FutureMealServiceImpl;
import com.futuremeal.service.impl.OrderServiceImpl;
import com.futuremeal.service.impl.RestaurantServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard and management APIs")
public class AdminController {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final FutureMealRepository futureMealRepository;
    private final RestaurantServiceImpl restaurantService;
    private final OrderServiceImpl orderService;
    private final FutureMealServiceImpl futureMealService;

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide statistics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        AdminStatsResponse stats = AdminStatsResponse.builder()
                .totalUsers(userRepository.countByIsActiveTrue())
                .totalRestaurants(restaurantRepository.countByStatus(RestaurantStatus.ACTIVE))
                .totalOrders(orderRepository.countTotalOrders())
                .totalRevenue(nullSafe(orderRepository.sumTotalRevenue()))
                .activeOrders(orderRepository.countActiveOrders())
                .futureMealsCreated(futureMealRepository.countTotal())
                .futureMealsConverted(futureMealRepository.countConverted())
                .todayOrders(orderRepository.countTodayOrders(startOfDay))
                .todayRevenue(nullSafe(orderRepository.sumTodayRevenue(startOfDay)))
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "Get all users with optional role filter")
    public ResponseEntity<ApiResponse<PageResponse>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (role != null) {
            var users = userRepository.findByRole(
                    UserRole.valueOf(role),
                    PageRequest.of(page, size, Sort.by("createdAt").descending()));
            return ResponseEntity.ok(ApiResponse.success(PageResponse.from(users)));
        }
        var users = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(users)));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Update user role")
    public ResponseEntity<ApiResponse<Object>> updateRole(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setRole(UserRole.valueOf(body.get("role")));
        return ResponseEntity.ok(ApiResponse.success(userRepository.save(user), "Role updated"));
    }

    @PatchMapping("/users/{id}/deactivate")
    @Operation(summary = "Deactivate a user account")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated"));
    }

    // ── Restaurants ───────────────────────────────────────────────────────────

    @GetMapping("/restaurants")
    @Operation(summary = "Get all restaurants with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse>> getRestaurants(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (status != null) {
            var restaurants = restaurantRepository.findByStatus(
                    RestaurantStatus.valueOf(status),
                    PageRequest.of(page, size, Sort.by("createdAt").descending()));
            return ResponseEntity.ok(ApiResponse.success(PageResponse.from(restaurants.map(restaurantService::toResponse))));
        }
        var restaurants = restaurantRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(restaurants.map(restaurantService::toResponse))));
    }

    @PatchMapping("/restaurants/{id}/approve")
    @Operation(summary = "Approve a pending restaurant")
    public ResponseEntity<ApiResponse<RestaurantResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                restaurantService.approve(id), "Restaurant approved"));
    }

    @PatchMapping("/restaurants/{id}/suspend")
    @Operation(summary = "Suspend a restaurant")
    public ResponseEntity<ApiResponse<RestaurantResponse>> suspend(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                restaurantService.suspend(id, body.get("reason")), "Restaurant suspended"));
    }

    // ── Orders ────────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    @Operation(summary = "Get all orders across the platform")
    public ResponseEntity<ApiResponse<PageResponse>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Delegate to order service
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.builder().content(List.of()).build()));
    }

    // ── FutureMeals ───────────────────────────────────────────────────────────

    @GetMapping("/future-meals")
    @Operation(summary = "Get all FutureMeals across the platform")
    public ResponseEntity<ApiResponse<List<FutureMealResponse>>> getAllFutureMeals(
            @RequestParam(required = false) String status) {
        List<com.futuremeal.entity.FutureMeal> meals;
        if (status != null) {
            meals = futureMealRepository.findByStatus(FutureMealStatus.valueOf(status));
        } else {
            meals = futureMealRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(
                meals.stream().map(futureMealService::toResponse).collect(Collectors.toList())));
    }

    private double nullSafe(Double val) {
        return val != null ? val : 0.0;
    }
}
