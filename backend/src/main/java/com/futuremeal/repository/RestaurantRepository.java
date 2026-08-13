package com.futuremeal.repository;

import com.futuremeal.entity.Restaurant;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Optional<Restaurant> findByOwner(User owner);

    List<Restaurant> findByStatusAndIsOpenTrue(RestaurantStatus status);

    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE r.status = 'ACTIVE' AND r.isOpen = true " +
           "AND LOWER(r.city) = LOWER(:city) ORDER BY r.rating DESC")
    List<Restaurant> findActiveByCity(@Param("city") String city, Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE r.status = 'ACTIVE' AND " +
           "(LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Restaurant> searchByQuery(@Param("query") String query);

    @Query("SELECT r FROM Restaurant r JOIN r.cuisines c WHERE r.status = 'ACTIVE' AND r.isOpen = true " +
           "AND LOWER(c) LIKE LOWER(CONCAT('%', :cuisine, '%'))")
    List<Restaurant> findByCuisine(@Param("cuisine") String cuisine, Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE r.status = 'ACTIVE' AND r.rating >= 4.0 ORDER BY r.rating DESC")
    List<Restaurant> findFeatured(Pageable pageable);

    long countByStatus(RestaurantStatus status);

    boolean existsByOwner(User owner);
}
