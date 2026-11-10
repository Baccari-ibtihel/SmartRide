package com.smartride.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

/**
 * Feign client to communicate with Booking Service.
 * Retrieves booking statistics for the dashboard.
 */
@FeignClient(name = "booking-service", url = "${services.booking-service.url:}", fallback = BookingServiceClientFallback.class)
public interface BookingServiceClient {

    @GetMapping("/api/bookings/health")
    String health();

    @GetMapping("/api/bookings/stats")
    Map<String, Object> getBookingStats();
}
