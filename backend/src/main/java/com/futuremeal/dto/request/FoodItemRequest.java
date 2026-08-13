package com.futuremeal.dto.request;

import com.futuremeal.entity.enums.DietaryType;
import com.futuremeal.entity.enums.SpiceLevel;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FoodItemRequest {

    @NotBlank(message = "Food name is required")
    private String name;

    private String description;
    private String image;

    @NotNull @Positive
    private Double price;

    private Double originalPrice;

    @NotBlank
    private String category;

    private DietaryType dietaryType = DietaryType.VEG;
    private SpiceLevel spiceLevel = SpiceLevel.MEDIUM;

    @Min(1) private Integer preparationTime = 20;

    private boolean isAvailable = true;
    private boolean isBestseller = false;
    private boolean isRecommended = false;
}
