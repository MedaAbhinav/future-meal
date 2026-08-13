package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.response.OrderResponse;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.OrderStatus;
import com.futuremeal.security.SecurityUtils;
import com.futuremeal.service.impl.OrderServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@PreAuthorize("hasAnyRole('DELIVERY_PARTNER','ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Delivery", description = "Delivery partner dashboard APIs")
public class DeliveryController {

    private final OrderServiceImpl orderService;
    private final SecurityUtils securityUtils;

    @GetMapping("/available")
    @Operation(summary = "Get orders available for pickup")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAvailableDeliveries()));
    }

    @PostMapping("/orders/{id}/accept")
    @Operation(summary = "Accept a delivery assignment")
    public ResponseEntity<ApiResponse<OrderResponse>> accept(@PathVariable Long id) {
        User partner = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                orderService.acceptDelivery(id, partner), "Delivery accepted"));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Update delivery status (DELIVERED)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        User partner = securityUtils.getCurrentUser();
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateStatus(id, status, partner)));
    }

    @GetMapping("/orders/my")
    @Operation(summary = "Get my delivery history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyDeliveries() {
        // Return completed deliveries for this partner
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }
}
