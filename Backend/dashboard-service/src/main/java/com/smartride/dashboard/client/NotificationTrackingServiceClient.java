package com.smartride.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

/**
 * Feign client to communicate with Notification/Tracking Service.
 * Retrieves tracking events statistics for the dashboard.
 */
@FeignClient(name = "notification-tracking-service", url = "${services.notification-tracking-service.url:}", fallback = NotificationTrackingServiceClientFallback.class)
public interface NotificationTrackingServiceClient {

    @GetMapping("/api/tracking/health")
    String health();

    @GetMapping("/api/tracking/stats")
    Map<String, Object> getTrackingStats();
}
