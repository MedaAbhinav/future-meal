package com.futuremeal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long id;
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private List<CartItemResponse> items;
    private Double subtotal;
    private Double deliveryFee;
    private Double taxes;
    private Double discount;
    private Double total;
    private String couponCode;

    @Data
    @Builder
    public static class CartItemResponse {
        private Long id;
        private FoodItemResponse foodItem;
        private Integer quantity;
        private String specialInstructions;
    }
}
