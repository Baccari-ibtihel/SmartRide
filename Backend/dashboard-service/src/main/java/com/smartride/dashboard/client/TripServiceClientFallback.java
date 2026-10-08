package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class TripServiceClientFallback implements TripServiceClient {

    @Override
    public Map<String, Object> getTripStatistics() {
        Map<String, Object> fallbackStats = new HashMap<>();
        fallbackStats.put("totalTripsPublished", 3840L);
        fallbackStats.put("completedTrips", 3520L);
        fallbackStats.put("cancelledTrips", 320L);
        fallbackStats.put("activeTrips", 145L);
        fallbackStats.put("status", "FALLBACK_DATA");
        return fallbackStats;
    }
}
