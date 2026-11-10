package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class BookingServiceClientFallback implements BookingServiceClient {

    @Override
    public String health() {
        return "Booking Service unavailable";
    }

    @Override
    public Map<String, Object> getBookingStats() {
        return Collections.singletonMap("error", "Booking Service unavailable");
    }
}
