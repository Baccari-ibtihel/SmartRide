package com.smartride.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

/**
 * Feign client to communicate with Trip Service.
 * Retrieves trip statistics for the dashboard.
 */
@FeignClient(name = "trip-service", url = "${services.trip-service.url:}", fallback = TripServiceClientFallback.class)
public interface TripServiceClient {

    @GetMapping("/api/trips/health")
    String health();

    @GetMapping("/api/trips/stats")
    Map<String, Object> getTripStats();
}
