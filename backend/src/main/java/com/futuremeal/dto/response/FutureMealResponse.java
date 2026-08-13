package com.futuremeal.dto.response;

import com.futuremeal.entity.enums.*;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FutureMealResponse {
    private Long id;
    private Long userId;
    private String description;
    private String plannedDate;
    private String plannedTime;
    private Double maxBudget;
    private CuisineType cuisine;
    private DietaryPreference dietaryPreference;
    private SpiceLevel spicePreference;
    private Long preferredRestaurantId;
    private String preferredRestaurantName;
    private AddressInfo deliveryAddress;
    private String specialConditions;
    private FutureMealStatus status;
    private FoodItemResponse recommendedFoodItem;
    private RestaurantResponse recommendedRestaurant;
    private Double recommendationScore;
    private String recommendationReason;
    private boolean isAIRecommended;
    private Long orderId;
    private String createdAt;
    private String updatedAt;

    @Data
    @Builder
    public static class AddressInfo {
        private Long id;
        private String label;
        private String street;
        private String area;
        private String city;
        private String pincode;
    }
}
