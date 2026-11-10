package com.smartride.ratingchat;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Microservice SmartRide : evaluations (Rating) + messagerie (Chat).
 * S'enregistre dans Eureka sous le nom "rating-chat-service".
 */
@SpringBootApplication
@EnableDiscoveryClient
@ConfigurationPropertiesScan
public class RatingChatServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RatingChatServiceApplication.class, args);
    }
}
