package com.futuremeal.repository;

import com.futuremeal.entity.Order;
import com.futuremeal.entity.Restaurant;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserOrderByPlacedAtDesc(User user, Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByRestaurantAndStatusIn(Restaurant restaurant, List<OrderStatus> statuses);

    List<Order> findByRestaurantOrderByPlacedAtDesc(Restaurant restaurant, Pageable pageable);

    List<Order> findByDeliveryPartnerAndStatusIn(User deliveryPartner, List<OrderStatus> statuses);

    Page<Order> findByOrderByPlacedAtDesc(Pageable pageable);

    Page<Order> findByStatusOrderByPlacedAtDesc(OrderStatus status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status NOT IN ('CANCELLED')")
    long countTotalOrders();

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.status = 'DELIVERED'")
    Double sumTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status NOT IN ('DELIVERED', 'CANCELLED')")
    long countActiveOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.placedAt >= :startOfDay")
    long countTodayOrders(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.status = 'DELIVERED' AND o.deliveredAt >= :startOfDay")
    Double sumTodayRevenue(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant = :restaurant AND o.status NOT IN ('CANCELLED')")
    long countByRestaurant(@Param("restaurant") Restaurant restaurant);

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.restaurant = :restaurant AND o.status = 'DELIVERED'")
    Double sumRevenueByRestaurant(@Param("restaurant") Restaurant restaurant);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant = :restaurant AND o.status NOT IN ('DELIVERED', 'CANCELLED')")
    long countActiveByRestaurant(@Param("restaurant") Restaurant restaurant);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant = :restaurant AND o.placedAt >= :startOfDay")
    long countTodayByRestaurant(@Param("restaurant") Restaurant restaurant, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.restaurant = :restaurant AND o.status = 'DELIVERED' AND o.deliveredAt >= :startOfDay")
    Double sumTodayRevenueByRestaurant(@Param("restaurant") Restaurant restaurant, @Param("startOfDay") LocalDateTime startOfDay);

    List<Order> findByStatusIn(List<OrderStatus> statuses);
}
