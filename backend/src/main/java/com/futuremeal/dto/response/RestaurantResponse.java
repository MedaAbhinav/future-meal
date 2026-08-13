package com.futuremeal.dto.response;

import com.futuremeal.entity.enums.RestaurantStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RestaurantResponse {
    private Long id;
    private String name;
    private String description;
    private String coverImage;
    private String logo;
    private List<String> cuisines;
    private Double rating;
    private Integer totalReviews;
    private Integer deliveryTime;
    private Integer deliveryFee;
    private Integer minimumOrder;
    private AddressInfo address;
    private boolean isOpen;
    private RestaurantStatus status;
    private List<String> offers;
    private List<String> tags;
    private Long ownerId;

    @Data
    @Builder
    public static class AddressInfo {
        private String street;
        private String area;
        private String city;
        private String state;
        private String pincode;
        private Double latitude;
        private Double longitude;
    }
}
