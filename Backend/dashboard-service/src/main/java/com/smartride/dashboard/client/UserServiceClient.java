package com.smartride.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

/**
 * Feign client to communicate with User Service.
 * Retrieves user statistics for the dashboard.
 */
@FeignClient(name = "user-service", url = "${services.user-service.url:}", fallback = UserServiceClientFallback.class)
public interface UserServiceClient {

    @GetMapping("/api/users/health")
    String health();

    @GetMapping("/api/users/stats")
    Map<String, Object> getUserStats();
}
