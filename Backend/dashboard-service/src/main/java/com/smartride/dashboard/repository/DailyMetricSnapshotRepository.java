package com.smartride.dashboard.repository;

import com.smartride.dashboard.entity.DailyMetricSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyMetricSnapshotRepository extends JpaRepository<DailyMetricSnapshot, Long> {

    Optional<DailyMetricSnapshot> findByMetricDate(LocalDate metricDate);

    List<DailyMetricSnapshot> findByMetricDateBetweenOrderByMetricDateAsc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT s FROM DailyMetricSnapshot s ORDER BY s.metricDate DESC LIMIT 1")
    Optional<DailyMetricSnapshot> findLatestSnapshot();

    @Query("SELECT SUM(s.totalRevenue) FROM DailyMetricSnapshot s WHERE s.metricDate BETWEEN :startDate AND :endDate")
    Double calculateTotalRevenueBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(s.platformCommission) FROM DailyMetricSnapshot s WHERE s.metricDate BETWEEN :startDate AND :endDate")
    Double calculateTotalCommissionBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
