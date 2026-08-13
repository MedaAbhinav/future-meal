package com.futuremeal.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RestaurantStatsResponse {
    private long todayOrders;
    private double todayRevenue;
    private long totalOrders;
    private double totalRevenue;
    private double averageRating;
    private long activeOrders;
    private List<PopularItem> popularItems;

    @Data
    @Builder
    public static class PopularItem {
        private Long foodItemId;
        private String foodItemName;
        private String foodItemImage;
        private long orderCount;
        private double revenue;
    }
}
