package com.smartride.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class GatewayInfoController {

    @GetMapping("/")
    public Mono<Map<String, Object>> getGatewayInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("service", "SmartRide Spring Cloud API Gateway");
        info.put("status", "UP");
        info.put("port", 8080);
        info.put("serviceDiscovery", "http://localhost:8761");
        info.put("security", "Keycloak IAM (Port 8180)");
        
        Map<String, String> routes = new LinkedHashMap<>();
        routes.put("dashboard-service", "/api/dashboard/**");
        routes.put("user-service", "/api/users/**");
        routes.put("trip-service", "/api/trips/**");
        routes.put("booking-service", "/api/bookings/**");
        routes.put("payment-service", "/api/payments/**");
        routes.put("rating-chat-service", "/api/ratings/**");
        routes.put("notification-tracking-service", "/api/notifications/**");
        routes.put("matching-ia-service", "/api/matching/**");
        info.put("activeRoutes", routes);
        
        info.put("message", "SmartRide API Gateway est opérationnel ! Toutes les routes sont actives et sécurisées.");
        return Mono.just(info);
    }
}
