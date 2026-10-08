package com.smartride.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private LocalDateTime generatedAt;
    private String period; // e.g. "LAST_30_DAYS"
    
    // Core KPIs
    private long totalUsers;
    private long totalTrips;
    private long totalBookings;
    private double totalRevenue;
    private double platformCommission;

    // Growth indicators (% vs previous period)
    private double userGrowthPercentage;
    private double tripGrowthPercentage;
    private double bookingGrowthPercentage;
    private double revenueGrowthPercentage;

    // Nested Detailed Modules
    private UserStatsDTO userStats;
    private TripStatsDTO tripStats;
    private BookingStatsDTO bookingStats;
    private PaymentStatsDTO paymentStats;
}
