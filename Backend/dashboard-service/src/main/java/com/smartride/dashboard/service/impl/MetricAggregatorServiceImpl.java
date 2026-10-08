package com.smartride.dashboard.service.impl;

import com.smartride.dashboard.client.*;
import com.smartride.dashboard.entity.DailyMetricSnapshot;
import com.smartride.dashboard.repository.DailyMetricSnapshotRepository;
import com.smartride.dashboard.service.MetricAggregatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricAggregatorServiceImpl implements MetricAggregatorService {

    private final DailyMetricSnapshotRepository snapshotRepository;
    private final UserServiceClient userServiceClient;
    private final TripServiceClient tripServiceClient;
    private final BookingServiceClient bookingServiceClient;
    private final PaymentServiceClient paymentServiceClient;

    @Override
    @Transactional
    public DailyMetricSnapshot generateOrUpdateDailySnapshot(LocalDate date) {
        log.info("Aggregating daily metric snapshot for date: {}", date);

        DailyMetricSnapshot snapshot = snapshotRepository.findByMetricDate(date)
                .orElse(DailyMetricSnapshot.builder()
                        .metricDate(date)
                        .build());

        // Fetch live stats from Feign clients
        try {
            Map<String, Object> userStats = userServiceClient.getUserStatistics();
            if (userStats != null && userStats.containsKey("totalUsers")) {
                snapshot.setTotalUsers(((Number) userStats.getOrDefault("totalUsers", 0)).longValue());
                snapshot.setActiveUsers(((Number) userStats.getOrDefault("activeUsers", 0)).longValue());
            }
        } catch (Exception e) {
            log.warn("Could not fetch user stats for snapshot: {}", e.getMessage());
        }

        try {
            Map<String, Object> tripStats = tripServiceClient.getTripStatistics();
            if (tripStats != null && tripStats.containsKey("totalTripsPublished")) {
                snapshot.setTotalTripsPublished(((Number) tripStats.getOrDefault("totalTripsPublished", 0)).longValue());
                snapshot.setCompletedTrips(((Number) tripStats.getOrDefault("completedTrips", 0)).longValue());
                snapshot.setCancelledTrips(((Number) tripStats.getOrDefault("cancelledTrips", 0)).longValue());
            }
        } catch (Exception e) {
            log.warn("Could not fetch trip stats for snapshot: {}", e.getMessage());
        }

        try {
            Map<String, Object> bookingStats = bookingServiceClient.getBookingStatistics();
            if (bookingStats != null && bookingStats.containsKey("totalBookings")) {
                snapshot.setTotalBookings(((Number) bookingStats.getOrDefault("totalBookings", 0)).longValue());
                snapshot.setConfirmedBookings(((Number) bookingStats.getOrDefault("confirmedBookings", 0)).longValue());
            }
        } catch (Exception e) {
            log.warn("Could not fetch booking stats for snapshot: {}", e.getMessage());
        }

        try {
            Map<String, Object> paymentStats = paymentServiceClient.getPaymentStatistics();
            if (paymentStats != null && paymentStats.containsKey("totalGrossVolume")) {
                snapshot.setTotalRevenue(((Number) paymentStats.getOrDefault("totalGrossVolume", 0.0)).doubleValue());
                snapshot.setPlatformCommission(((Number) paymentStats.getOrDefault("totalPlatformRevenue", 0.0)).doubleValue());
            }
        } catch (Exception e) {
            log.warn("Could not fetch payment stats for snapshot: {}", e.getMessage());
        }

        return snapshotRepository.save(snapshot);
    }

    @Override
    @Transactional
    public void aggregateAndSaveHistoricalMetrics() {
        LocalDate today = LocalDate.now();
        generateOrUpdateDailySnapshot(today);
    }
}
