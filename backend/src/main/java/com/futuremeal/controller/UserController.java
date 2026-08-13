package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.request.AddressRequest;
import com.futuremeal.dto.response.AddressResponse;
import com.futuremeal.dto.response.AuthResponse;
import com.futuremeal.entity.User;
import com.futuremeal.security.SecurityUtils;
import com.futuremeal.service.impl.UserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and address management")
public class UserController {

    private final UserServiceImpl userService;
    private final SecurityUtils securityUtils;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<AuthResponse.UserResponse>> getProfile() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(user)));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<AuthResponse.UserResponse>> updateProfile(
            @RequestBody Map<String, Object> updates) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateProfile(user, updates), "Profile updated"));
    }

    @PutMapping("/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        userService.changePassword(user, body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    // ── Addresses ────────────────────────────────────────────────────────────

    @GetMapping("/addresses")
    @Operation(summary = "Get all delivery addresses for current user")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userService.getAddresses(user)));
    }

    @PostMapping("/addresses")
    @Operation(summary = "Add a new delivery address")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @Valid @RequestBody AddressRequest req) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userService.addAddress(user, req), "Address added"));
    }

    @PutMapping("/addresses/{id}")
    @Operation(summary = "Update a delivery address")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest req) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateAddress(user, id, req), "Address updated"));
    }

    @DeleteMapping("/addresses/{id}")
    @Operation(summary = "Delete a delivery address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        userService.deleteAddress(user, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Address deleted"));
    }

    @PatchMapping("/addresses/{id}/default")
    @Operation(summary = "Set address as default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                userService.setDefaultAddress(user, id), "Default address updated"));
    }
}
