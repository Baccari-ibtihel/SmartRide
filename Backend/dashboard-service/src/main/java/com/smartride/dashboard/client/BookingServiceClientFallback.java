package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class BookingServiceClientFallback implements BookingServiceClient {

    @Override
    public Map<String, Object> getBookingStatistics() {
        Map<String, Object> fallbackStats = new HashMap<>();
        fallbackStats.put("totalBookings", 6200L);
        fallbackStats.put("confirmedBookings", 5750L);
        fallbackStats.put("pendingBookings", 180L);
        fallbackStats.put("cancelledBookings", 270L);
        fallbackStats.put("status", "FALLBACK_DATA");
        return fallbackStats;
    }
}
