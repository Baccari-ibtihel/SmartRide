package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationServiceClientFallback implements NotificationServiceClient {

    @Override
    public Map<String, Object> getNotificationStatistics() {
        Map<String, Object> fallbackStats = new HashMap<>();
        fallbackStats.put("totalNotificationsSent", 14500L);
        fallbackStats.put("activeGpsTrackings", 42L);
        fallbackStats.put("status", "FALLBACK_DATA");
        return fallbackStats;
    }
}
