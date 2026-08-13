package com.futuremeal.repository;

import com.futuremeal.entity.Restaurant;
import com.futuremeal.entity.Review;
import com.futuremeal.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRestaurantOrderByCreatedAtDesc(Restaurant restaurant, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant = :restaurant")
    Double findAverageRatingByRestaurant(@Param("restaurant") Restaurant restaurant);

    long countByRestaurant(Restaurant restaurant);

    boolean existsByUserAndOrderId(User user, Long orderId);
}
