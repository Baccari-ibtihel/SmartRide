package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class NotificationTrackingServiceClientFallback implements NotificationTrackingServiceClient {

    @Override
    public String health() {
        return "Notification/Tracking Service unavailable";
    }

    @Override
    public Map<String, Object> getTrackingStats() {
        return Collections.singletonMap("error", "Notification/Tracking Service unavailable");
    }
}
