package com.futuremeal.entity;

import com.futuremeal.entity.enums.RestaurantStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "restaurants", indexes = {
    @Index(name = "idx_restaurant_status", columnList = "status"),
    @Index(name = "idx_restaurant_city", columnList = "city"),
    @Index(name = "idx_restaurant_owner", columnList = "owner_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String coverImage;

    @Column(length = 500)
    private String logo;

    @ElementCollection
    @CollectionTable(name = "restaurant_cuisines", joinColumns = @JoinColumn(name = "restaurant_id"))
    @Column(name = "cuisine")
    @Builder.Default
    private List<String> cuisines = new ArrayList<>();

    @DecimalMin("0.0") @DecimalMax("5.0")
    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Min(0)
    @Builder.Default
    private Integer deliveryTime = 30; // in minutes

    @Min(0)
    @Builder.Default
    private Integer deliveryFee = 0; // in rupees

    @Min(0)
    @Builder.Default
    private Integer minimumOrder = 99;

    // Address fields
    @Column
    private String street;

    @Column
    private String area;

    @Column
    private String city;

    @Column(name = "restaurant_state")
    private String state;

    @Column
    private String pincode;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    @Builder.Default
    private boolean isOpen = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RestaurantStatus status = RestaurantStatus.PENDING_APPROVAL;

    @ElementCollection
    @CollectionTable(name = "restaurant_offers", joinColumns = @JoinColumn(name = "restaurant_id"))
    @Column(name = "offer")
    @Builder.Default
    private List<String> offers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "restaurant_tags", joinColumns = @JoinColumn(name = "restaurant_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FoodItem> foodItems = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
