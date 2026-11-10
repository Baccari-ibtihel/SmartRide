package com.smartride.dashboard.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

/**
 * Feign client to communicate with Payment Service.
 * Retrieves revenue and payment statistics for the dashboard.
 */
@FeignClient(name = "payment-service", url = "${services.payment-service.url:}", fallback = PaymentServiceClientFallback.class)
public interface PaymentServiceClient {

    @GetMapping("/api/payments/health")
    String health();

    @GetMapping("/api/payments/stats")
    Map<String, Object> getPaymentStats();
}
