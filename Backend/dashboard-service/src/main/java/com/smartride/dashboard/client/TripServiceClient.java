package com.smartride.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "trip-service", fallback = TripServiceClientFallback.class)
public interface TripServiceClient {

    @GetMapping("/api/trips/stats")
    Map<String, Object> getTripStatistics();
}
