package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public Map<String, Object> getUserStatistics() {
        Map<String, Object> fallbackStats = new HashMap<>();
        fallbackStats.put("totalUsers", 1450L);
        fallbackStats.put("activeUsers", 1120L);
        fallbackStats.put("driversCount", 480L);
        fallbackStats.put("passengersCount", 970L);
        fallbackStats.put("status", "FALLBACK_DATA");
        return fallbackStats;
    }
}
