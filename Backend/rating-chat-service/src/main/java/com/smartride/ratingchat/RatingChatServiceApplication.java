package com.smartride.ratingchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
@RequestMapping("/api/rating-chat")
public class RatingChatServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(RatingChatServiceApplication.class, args);
    }

    @GetMapping("/health")
    public String health() {
        return "Rating + Chat Service is up and running!";
    }
}
