package com.smartride.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO aggregating all platform statistics for the admin dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    // Aggregated counters
    private Long totalUsers;
    private Long totalTrips;
    private Long totalBookings;
    private Double totalRevenue;

    // Per-service raw stats (from Feign clients)
    private Map<String, Object> userStats;
    private Map<String, Object> tripStats;
    private Map<String, Object> bookingStats;
    private Map<String, Object> paymentStats;
    private Map<String, Object> trackingStats;

    // Service health status
    private String userServiceStatus;
    private String tripServiceStatus;
    private String bookingServiceStatus;
    private String paymentServiceStatus;
    private String notificationTrackingServiceStatus;
}
