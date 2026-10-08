package com.smartride.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripStatsDTO {
    private long totalTripsPublished;
    private long activeTrips;
    private long completedTrips;
    private long cancelledTrips;
    private double completionRatePercentage;
    private double totalDistanceKm;
    private List<TimeSeriesPointDTO> tripPublicationTrend;
    private Map<String, Long> popularRoutes;
}
