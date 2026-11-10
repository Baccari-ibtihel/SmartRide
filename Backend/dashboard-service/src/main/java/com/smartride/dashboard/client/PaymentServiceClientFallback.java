package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class PaymentServiceClientFallback implements PaymentServiceClient {

    @Override
    public String health() {
        return "Payment Service unavailable";
    }

    @Override
    public Map<String, Object> getPaymentStats() {
        return Collections.singletonMap("error", "Payment Service unavailable");
    }
}
