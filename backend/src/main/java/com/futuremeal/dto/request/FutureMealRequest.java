package com.futuremeal.dto.request;

import com.futuremeal.entity.enums.CuisineType;
import com.futuremeal.entity.enums.DietaryPreference;
import com.futuremeal.entity.enums.SpiceLevel;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class FutureMealRequest {

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description too long")
    private String description;

    @NotNull(message = "Planned date is required")
    @FutureOrPresent(message = "Planned date must be today or in the future")
    private LocalDate plannedDate;

    @NotNull(message = "Planned time is required")
    private LocalTime plannedTime;

    @NotNull(message = "Budget is required")
    @Min(value = 50, message = "Budget must be at least ₹50")
    @Max(value = 10000, message = "Budget cannot exceed ₹10,000")
    private Double maxBudget;

    private CuisineType cuisine = CuisineType.ANY;

    private DietaryPreference dietaryPreference = DietaryPreference.NON_VEG;

    private SpiceLevel spicePreference = SpiceLevel.MEDIUM;

    private Long preferredRestaurantId;

    @NotNull(message = "Delivery address is required")
    private Long deliveryAddressId;

    @Size(max = 500, message = "Special conditions too long")
    private String specialConditions;
}
