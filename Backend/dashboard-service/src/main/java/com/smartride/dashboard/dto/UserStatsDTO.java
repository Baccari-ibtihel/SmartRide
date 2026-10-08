package com.smartride.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsDTO {
    private long totalUsers;
    private long activeUsers;
    private long driversCount;
    private long passengersCount;
    private long newUsersThisMonth;
    private double userGrowthRatePercentage;
    private List<TimeSeriesPointDTO> userRegistrationTrend;
    private List<TimeSeriesPointDTO> activeUserTrend;
}
