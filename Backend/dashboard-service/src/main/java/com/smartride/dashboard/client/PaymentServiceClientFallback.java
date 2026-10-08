package com.smartride.dashboard.client;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class PaymentServiceClientFallback implements PaymentServiceClient {

    @Override
    public Map<String, Object> getPaymentStatistics() {
        Map<String, Object> fallbackStats = new HashMap<>();
        fallbackStats.put("totalGrossVolume", 125000.0);
        fallbackStats.put("totalPlatformRevenue", 18750.0);
        fallbackStats.put("totalTransactions", 5800L);
        fallbackStats.put("status", "FALLBACK_DATA");
        return fallbackStats;
    }
}
