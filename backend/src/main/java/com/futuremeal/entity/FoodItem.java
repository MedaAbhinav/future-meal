package com.futuremeal.entity;

import com.futuremeal.entity.enums.DietaryType;
import com.futuremeal.entity.enums.SpiceLevel;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "food_items", indexes = {
    @Index(name = "idx_food_restaurant", columnList = "restaurant_id"),
    @Index(name = "idx_food_category", columnList = "category"),
    @Index(name = "idx_food_dietary", columnList = "dietary_type")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String image;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double price;

    private Double originalPrice;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DietaryType dietaryType = DietaryType.VEG;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SpiceLevel spiceLevel = SpiceLevel.MEDIUM;

    @DecimalMin("0.0") @DecimalMax("5.0")
    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Min(1)
    @Builder.Default
    private Integer preparationTime = 20; // minutes

    @Column(nullable = false)
    @Builder.Default
    private boolean isAvailable = true;

    @Builder.Default
    private boolean isBestseller = false;

    @Builder.Default
    private boolean isRecommended = false;

    @ElementCollection
    @CollectionTable(name = "food_allergens", joinColumns = @JoinColumn(name = "food_id"))
    @Column(name = "allergen")
    @Builder.Default
    private List<String> allergens = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "food_tags", joinColumns = @JoinColumn(name = "food_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    // Nutrition info
    private Integer calories;
    private Double protein;
    private Double carbs;
    private Double fat;

    @Builder.Default
    private Integer orderCount = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
