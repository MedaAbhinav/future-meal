package com.futuremeal.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class RestaurantRequest {

    @NotBlank(message = "Restaurant name is required")
    private String name;

    private String description;
    private String coverImage;
    private String logo;

    @NotEmpty(message = "At least one cuisine type is required")
    private List<String> cuisines;

    @Min(0) private Integer deliveryTime = 30;
    @Min(0) private Integer deliveryFee = 0;
    @Min(0) private Integer minimumOrder = 99;

    @NotBlank private String street;
    @NotBlank private String area;
    @NotBlank private String city;
    @NotBlank private String state;
    @Pattern(regexp = "\\d{6}") private String pincode;

    private Double latitude;
    private Double longitude;
    private List<String> offers;
    private List<String> tags;
}
