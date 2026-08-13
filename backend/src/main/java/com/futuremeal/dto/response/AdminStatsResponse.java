package com.futuremeal.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalRestaurants;
    private long totalOrders;
    private double totalRevenue;
    private long activeOrders;
    private long futureMealsCreated;
    private long futureMealsConverted;
    private long todayOrders;
    private double todayRevenue;
}
