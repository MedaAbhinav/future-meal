package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.PageResponse;
import com.futuremeal.dto.request.OrderRequest;
import com.futuremeal.dto.response.OrderResponse;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.OrderStatus;
import com.futuremeal.security.SecurityUtils;
import com.futuremeal.service.impl.OrderServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Place and track orders")
public class OrderController {

    private final OrderServiceImpl orderService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    @Operation(summary = "Place a new order from current cart")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody OrderRequest req) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        orderService.placeOrder(user, req), "Order placed successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    @Operation(summary = "Get all orders for current user")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = securityUtils.getCurrentUser();
        Page<OrderResponse> orders = orderService.getMyOrders(user, page, size);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(orders)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id, user)));
    }

    @GetMapping("/track/{orderNumber}")
    @Operation(summary = "Track order by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> track(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getByOrderNumber(orderNumber)));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        String reason = body.getOrDefault("reason", "Cancelled by customer");
        return ResponseEntity.ok(ApiResponse.success(
                orderService.cancelOrder(id, user, reason), "Order cancelled"));
    }
}
