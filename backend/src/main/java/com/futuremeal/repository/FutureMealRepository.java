package com.futuremeal.repository;

import com.futuremeal.entity.FutureMeal;
import com.futuremeal.entity.User;
import com.futuremeal.entity.enums.FutureMealStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface FutureMealRepository extends JpaRepository<FutureMeal, Long> {

    List<FutureMeal> findByUserOrderByCreatedAtDesc(User user);

    List<FutureMeal> findByStatus(FutureMealStatus status);

    @Query("SELECT fm FROM FutureMeal fm WHERE fm.status IN ('PLANNED', 'MATCH_FOUND') " +
           "AND fm.plannedDate = :date " +
           "AND fm.plannedTime BETWEEN :fromTime AND :toTime")
    List<FutureMeal> findDueForEvaluation(
            @Param("date") LocalDate date,
            @Param("fromTime") LocalTime fromTime,
            @Param("toTime") LocalTime toTime);

    @Query("SELECT fm FROM FutureMeal fm WHERE fm.status IN ('PLANNED', 'MATCH_FOUND') " +
           "AND fm.plannedDate < :today")
    List<FutureMeal> findExpired(@Param("today") LocalDate today);

    long countByStatus(FutureMealStatus status);

    @Query("SELECT COUNT(fm) FROM FutureMeal fm WHERE fm.status = 'ORDERED'")
    long countConverted();

    @Query("SELECT COUNT(fm) FROM FutureMeal fm")
    long countTotal();
}
