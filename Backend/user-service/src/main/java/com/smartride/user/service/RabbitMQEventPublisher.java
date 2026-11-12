package com.smartride.user.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartride.user.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class RabbitMQEventPublisher {

    @Value("${rabbitmq.api.url:http://rabbitmq:15672}")
    private String rabbitApiUrl;

    @Value("${rabbitmq.username:guest}")
    private String username;

    @Value("${rabbitmq.password:guest}")
    private String password;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void publishUserRegistered(User user) {
        publishEvent("user.created", "USER_REGISTERED", user);
    }

    public void publishUserUpdated(User user) {
        publishEvent("user.updated", "USER_UPDATED", user);
    }

    public void publishUserDeleted(Long userId, String email) {
        try {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("eventType", "USER_DELETED");
            eventData.put("userId", userId);
            eventData.put("email", email);
            eventData.put("fullName", "Utilisateur #" + userId);
            eventData.put("role", "NONE");
            eventData.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            sendToRabbitMQ("user.deleted", eventData);
        } catch (Exception e) {
            System.err.println("RabbitMQ publish delete notice: " + e.getMessage());
        }
    }

    private void publishEvent(String routingKey, String eventType, User user) {
        try {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("eventType", eventType);
            eventData.put("userId", user.getId());
            eventData.put("email", user.getEmail());
            eventData.put("fullName", (user.getFirstName() + " " + user.getLastName()).trim());
            eventData.put("role", user.getRole());
            eventData.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            sendToRabbitMQ(routingKey, eventData);
        } catch (Exception e) {
            System.err.println("Notice: RabbitMQ event publishing error: " + e.getMessage());
        }
    }

    private void sendToRabbitMQ(String routingKey, Map<String, Object> eventData) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(username, password);

            String jsonPayload = objectMapper.writeValueAsString(eventData);

            Map<String, Object> rabbitMsg = new HashMap<>();
            Map<String, Object> props = new HashMap<>();
            props.put("content_type", "application/json");
            rabbitMsg.put("properties", props);
            rabbitMsg.put("routing_key", routingKey);
            rabbitMsg.put("payload", jsonPayload);
            rabbitMsg.put("payload_encoding", "string");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(rabbitMsg, headers);
            java.net.URI publishUri = java.net.URI.create(rabbitApiUrl + "/api/exchanges/%2F/smartride.exchange/publish");

            restTemplate.postForEntity(publishUri, request, String.class);
            System.out.println("✅ RabbitMQ: Event " + eventData.get("eventType") + " successfully published to smartride.exchange [" + routingKey + "]");
        } catch (Exception e) {
            System.err.println("Notice: RabbitMQ dispatch error: " + e.getMessage());
        }
    }
}
