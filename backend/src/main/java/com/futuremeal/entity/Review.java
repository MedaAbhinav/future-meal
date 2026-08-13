package com.futuremeal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_review_restaurant", columnList = "restaurant_id"),
    @Index(name = "idx_review_user", columnList = "user_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column
    private Long orderId;

    @DecimalMin("1.0") @DecimalMax("5.0")
    @Column(nullable = false)
    private Double rating;

    @Column(length = 1000)
    private String comment;

    private Double foodRating;
    private Double deliveryRating;

    @Builder.Default
    private Integer helpfulCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
