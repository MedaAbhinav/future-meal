package com.futuremeal.dto.response;

import com.futuremeal.entity.enums.OrderStatus;
import com.futuremeal.entity.enums.PaymentMethod;
import com.futuremeal.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantLogo;
    private List<OrderItemResponse> items;
    private AddressResponse deliveryAddress;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private Double subtotal;
    private Double deliveryFee;
    private Double taxes;
    private Double discount;
    private Double total;
    private String specialInstructions;
    private Integer estimatedDeliveryTime;
    private Long deliveryPartnerId;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private String placedAt;
    private String confirmedAt;
    private String preparingAt;
    private String readyAt;
    private String pickedUpAt;
    private String deliveredAt;
    private String cancelledAt;
    private String cancellationReason;

    @Data
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long foodItemId;
        private String foodItemName;
        private String foodItemImage;
        private Double price;
        private Integer quantity;
        private String specialInstructions;
        private Double subtotal;
    }

    @Data
    @Builder
    public static class AddressResponse {
        private Long id;
        private String label;
        private String street;
        private String area;
        private String city;
        private String state;
        private String pincode;
        private String landmark;
    }
}
