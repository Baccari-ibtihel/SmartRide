package com.smartride.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entree unique du backend SmartRide (port 8080).
 * Les routes sont declarees dans application.yml et resolues via Eureka (lb://nom-du-service).
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
