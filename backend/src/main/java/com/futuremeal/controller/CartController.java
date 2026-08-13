package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.request.CartItemRequest;
import com.futuremeal.dto.response.CartResponse;
import com.futuremeal.entity.User;
import com.futuremeal.security.SecurityUtils;
import com.futuremeal.service.impl.CartServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart management")
public class CartController {

    private final CartServiceImpl cartService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(user)));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @Valid @RequestBody CartItemRequest req) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                cartService.addItem(user, req), "Item added to cart"));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity or instructions")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> body) {
        User user = securityUtils.getCurrentUser();
        int quantity = (int) body.getOrDefault("quantity", 1);
        String instructions = (String) body.get("specialInstructions");
        return ResponseEntity.ok(ApiResponse.success(
                cartService.updateItem(user, itemId, quantity, instructions)));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@PathVariable Long itemId) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                cartService.removeItem(user, itemId), "Item removed"));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        User user = securityUtils.getCurrentUser();
        cartService.clearCart(user);
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared"));
    }

    @PostMapping("/coupon")
    @Operation(summary = "Apply a coupon code")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(
            @RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                cartService.applyCoupon(user, body.get("couponCode")), "Coupon applied"));
    }

    @DeleteMapping("/coupon")
    @Operation(summary = "Remove applied coupon")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                cartService.removeCoupon(user), "Coupon removed"));
    }
}
