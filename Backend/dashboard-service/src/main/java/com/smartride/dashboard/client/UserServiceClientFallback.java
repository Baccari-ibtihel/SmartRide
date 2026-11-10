package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public String health() {
        return "User Service unavailable";
    }

    @Override
    public Map<String, Object> getUserStats() {
        return Collections.singletonMap("error", "User Service unavailable");
    }
}
