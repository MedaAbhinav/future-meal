package com.futuremeal.controller;

import com.futuremeal.dto.ApiResponse;
import com.futuremeal.dto.request.FutureMealRequest;
import com.futuremeal.dto.response.FutureMealResponse;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.PaymentMethod;
import com.futuremeal.security.SecurityUtils;
import com.futuremeal.service.impl.FutureMealServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/future-meals")
@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
@RequiredArgsConstructor
@Tag(name = "FutureMeal", description = "Plan and manage future meals")
public class FutureMealController {

    private final FutureMealServiceImpl futureMealService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @Operation(summary = "Create a new FutureMeal plan")
    public ResponseEntity<ApiResponse<FutureMealResponse>> create(
            @Valid @RequestBody FutureMealRequest req) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        futureMealService.create(user, req), "FutureMeal created"));
    }

    @GetMapping
    @Operation(summary = "Get all FutureMeals for current user")
    public ResponseEntity<ApiResponse<List<FutureMealResponse>>> getAll() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(futureMealService.getMyFutureMeals(user)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get FutureMeal by ID")
    public ResponseEntity<ApiResponse<FutureMealResponse>> getById(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(futureMealService.getById(id, user)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a FutureMeal plan")
    public ResponseEntity<ApiResponse<FutureMealResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody FutureMealRequest req) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                futureMealService.update(id, user, req), "FutureMeal updated"));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a FutureMeal plan")
    public ResponseEntity<ApiResponse<FutureMealResponse>> cancel(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                futureMealService.cancel(id, user), "FutureMeal cancelled"));
    }

    @PatchMapping("/{id}/postpone")
    @Operation(summary = "Postpone a FutureMeal to a new date/time")
    public ResponseEntity<ApiResponse<FutureMealResponse>> postpone(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        LocalDate newDate = LocalDate.parse(body.get("newDate"));
        LocalTime newTime = LocalTime.parse(body.get("newTime"));
        return ResponseEntity.ok(ApiResponse.success(
                futureMealService.postpone(id, user, newDate, newTime), "FutureMeal postponed"));
    }

    @PostMapping("/{id}/evaluate")
    @Operation(summary = "Manually trigger recommendation evaluation for a FutureMeal")
    public ResponseEntity<ApiResponse<FutureMealResponse>> evaluate(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                futureMealService.evaluate(id, user), "Evaluation complete"));
    }

    @PostMapping("/{id}/order")
    @Operation(summary = "Convert a READY FutureMeal recommendation into an actual order")
    public ResponseEntity<ApiResponse<com.futuremeal.dto.response.OrderResponse>> order(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        PaymentMethod method = PaymentMethod.valueOf(
                body.getOrDefault("paymentMethod", "CASH_ON_DELIVERY"));
        com.futuremeal.dto.response.OrderResponse orderResponse = futureMealService.orderFutureMeal(id, user, method);
        return ResponseEntity.ok(ApiResponse.success(orderResponse, "Order placed from FutureMeal"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a FutureMeal plan")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        futureMealService.delete(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }
}
