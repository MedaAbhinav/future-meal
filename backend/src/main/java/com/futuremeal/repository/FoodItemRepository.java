package com.futuremeal.repository;

import com.futuremeal.entity.FoodItem;
import com.futuremeal.entity.Restaurant;
import com.futuremeal.entity.enums.DietaryType;
import com.futuremeal.entity.enums.SpiceLevel;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByRestaurantAndIsAvailableTrue(Restaurant restaurant);

    List<FoodItem> findByRestaurant(Restaurant restaurant);

    List<FoodItem> findByRestaurantAndCategoryOrderByNameAsc(Restaurant restaurant, String category);

    @Query("SELECT f FROM FoodItem f WHERE f.restaurant = :restaurant ORDER BY f.isBestseller DESC, f.rating DESC")
    List<FoodItem> findByRestaurantOrderByPopularity(@Param("restaurant") Restaurant restaurant);

    @Query("SELECT f FROM FoodItem f WHERE f.isAvailable = true AND f.restaurant.status = 'ACTIVE' " +
           "AND (LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<FoodItem> searchFoods(@Param("query") String query);

    @Query("SELECT f FROM FoodItem f WHERE f.isAvailable = true AND f.restaurant.status = 'ACTIVE' " +
           "AND f.restaurant.isOpen = true AND f.isBestseller = true ORDER BY f.orderCount DESC")
    List<FoodItem> findPopular(Pageable pageable);

    @Query("SELECT f FROM FoodItem f WHERE f.isAvailable = true AND f.restaurant.status = 'ACTIVE' " +
           "AND f.restaurant.isOpen = true AND f.price <= :maxBudget " +
           "AND (:dietaryType IS NULL OR f.dietaryType = :dietaryType) " +
           "AND (:spiceLevel IS NULL OR f.spiceLevel = :spiceLevel) " +
           "ORDER BY f.rating DESC")
    List<FoodItem> findByBudgetAndPreferences(
            @Param("maxBudget") Double maxBudget,
            @Param("dietaryType") DietaryType dietaryType,
            @Param("spiceLevel") SpiceLevel spiceLevel,
            Pageable pageable);

    @Query("SELECT f FROM FoodItem f WHERE f.isAvailable = true AND f.restaurant.status = 'ACTIVE' " +
           "AND f.restaurant.isOpen = true AND LOWER(f.category) LIKE LOWER(CONCAT('%', :cuisine, '%')) " +
           "ORDER BY f.rating DESC")
    List<FoodItem> findByCuisine(@Param("cuisine") String cuisine, Pageable pageable);

    @Query("SELECT f FROM FoodItem f WHERE f.restaurant = :restaurant AND f.isBestseller = true " +
           "ORDER BY f.orderCount DESC")
    List<FoodItem> findBestsellersByRestaurant(@Param("restaurant") Restaurant restaurant, Pageable pageable);

    @Query("SELECT f.category, COUNT(f) FROM FoodItem f WHERE f.restaurant = :restaurant " +
           "GROUP BY f.category ORDER BY MIN(f.id)")
    List<Object[]> findCategoriesByRestaurant(@Param("restaurant") Restaurant restaurant);
}
