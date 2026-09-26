package com.smartride.notiftrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
@RequestMapping("/api/notifications-tracking")
public class NotificationTrackingServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationTrackingServiceApplication.class, args);
    }

    @GetMapping("/health")
    public String health() {
        return "Notification & Tracking Service is up and running!";
    }
}
