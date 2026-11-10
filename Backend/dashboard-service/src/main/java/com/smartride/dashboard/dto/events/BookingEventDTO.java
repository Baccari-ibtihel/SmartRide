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
public class BookingEventDTO implements Serializable {
    private String eventType; // BOOKING_CREATED, BOOKING_CONFIRMED, BOOKING_CANCELLED, BOOKING_COMPLETED
    private Long bookingId;
    private Long tripId;
    private Long passengerId;
    private String passengerName;
    private Integer seats;
    private Double totalPrice;
    private String status;
    private LocalDateTime timestamp;
}
