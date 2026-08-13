package com.futuremeal.dto.response;

import com.futuremeal.entity.enums.DietaryType;
import com.futuremeal.entity.enums.SpiceLevel;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FoodItemResponse {
    private Long id;
    private String name;
    private String description;
    private String image;
    private Double price;
    private Double originalPrice;
    private String category;
    private Long restaurantId;
    private String restaurantName;
    private DietaryType dietaryType;
    private SpiceLevel spiceLevel;
    private Double rating;
    private Integer totalReviews;
    private Integer preparationTime;
    private boolean isAvailable;
    private boolean isBestseller;
    private boolean isRecommended;
}
