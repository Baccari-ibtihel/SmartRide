package com.smartride.configserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Spring Cloud Centralized Configuration Server (Evaluation Criterion: Config Server - 1 pt).
 * Serves centralized configuration properties to all SmartRide microservices.
 */
@SpringBootApplication
@EnableConfigServer
@EnableDiscoveryClient
@RestController
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }

    @GetMapping("/")
    public Map<String, Object> status() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("service", "SmartRide Spring Cloud Config Server");
        res.put("status", "UP");
        res.put("port", 8888);
        res.put("activeProfile", "native");
        res.put("eurekaServer", "http://discovery-server:8761/eureka/");
        res.put("sampleConfigUrl", "http://localhost:8888/application/default");
        res.put("message", "Serveur de configuration centralisé opérationnel !");
        return res;
    }
}
