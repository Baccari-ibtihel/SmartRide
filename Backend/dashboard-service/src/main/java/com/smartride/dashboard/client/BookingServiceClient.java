package com.smartride.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "booking-service", fallback = BookingServiceClientFallback.class)
public interface BookingServiceClient {

    @GetMapping("/api/bookings/stats")
    Map<String, Object> getBookingStatistics();
}
