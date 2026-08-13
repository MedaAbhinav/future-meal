package com.futuremeal.entity;

import com.futuremeal.entity.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "future_meals", indexes = {
    @Index(name = "idx_futuremeal_user", columnList = "user_id"),
    @Index(name = "idx_futuremeal_status", columnList = "status"),
    @Index(name = "idx_futuremeal_date", columnList = "planned_date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FutureMeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String description;

    @NotNull
    @Column(nullable = false)
    private LocalDate plannedDate;

    @NotNull
    @Column(nullable = false)
    private LocalTime plannedTime;

    @Min(50)
    @Column(nullable = false)
    private Double maxBudget;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CuisineType cuisine = CuisineType.ANY;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DietaryPreference dietaryPreference = DietaryPreference.NON_VEG;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SpiceLevel spicePreference = SpiceLevel.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_restaurant_id")
    private Restaurant preferredRestaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_address_id", nullable = false)
    private Address deliveryAddress;

    @Column(length = 500)
    private String specialConditions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FutureMealStatus status = FutureMealStatus.PLANNED;

    // Recommendation results
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_food_item_id")
    private FoodItem recommendedFoodItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_restaurant_id")
    private Restaurant recommendedRestaurant;

    @Column
    private Double recommendationScore;

    @Column(length = 1000)
    private String recommendationReason;

    @Column(nullable = false)
    @Builder.Default
    private boolean isAIRecommended = false;

    // Order link if placed
    @Column
    private Long orderId;

    // Status tracking timestamps
    private LocalDateTime matchFoundAt;
    private LocalDateTime readyAt;
    private LocalDateTime orderedAt;
    private LocalDateTime postponedAt;
    private LocalDateTime cancelledAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
