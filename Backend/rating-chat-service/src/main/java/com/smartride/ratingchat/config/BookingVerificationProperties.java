package com.smartride.ratingchat.config;


import java.util.List;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Configuration "smartride.booking-verification.*" (voir application.yml).
 *
 * @param enabled         true = avant chaque evaluation on interroge le Booking Service via Eureka
 * @param serviceId       nom sous lequel le Booking Service est enregistre dans Eureka
 * @param allowedStatuses statuts de reservation autorisant une evaluation
 */
@ConfigurationProperties(prefix = "smartride.booking-verification")
public record BookingVerificationProperties(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("booking-service") String serviceId,
        @DefaultValue("COMPLETED") List<String> allowedStatuses) {
}
