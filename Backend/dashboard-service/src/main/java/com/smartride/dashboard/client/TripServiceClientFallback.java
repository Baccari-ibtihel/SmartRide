package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class TripServiceClientFallback implements TripServiceClient {

    @Override
    public String health() {
        return "Trip Service unavailable";
    }

    @Override
    public Map<String, Object> getTripStats() {
        return Collections.singletonMap("error", "Trip Service unavailable");
    }
}
