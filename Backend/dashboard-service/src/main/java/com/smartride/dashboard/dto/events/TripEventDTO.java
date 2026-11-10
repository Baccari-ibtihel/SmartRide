package com.smartride.dashboard.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripEventDTO implements Serializable {
    private String eventType; // TRIP_CREATED, TRIP_STARTED, TRIP_COMPLETED, TRIP_CANCELLED
    private Long tripId;
    private Long driverId;
    private String driverName;
    private String origin;
    private String destination;
    private Integer availableSeats;
    private Double price;
    private Double iaMatchScore;
    private LocalDateTime departureTime;
    private LocalDateTime timestamp;
}
