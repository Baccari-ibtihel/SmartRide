package com.smartride.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "notification-tracking-service", fallback = NotificationServiceClientFallback.class)
public interface NotificationServiceClient {

    @GetMapping("/api/notifications/stats")
    Map<String, Object> getNotificationStatistics();
}
