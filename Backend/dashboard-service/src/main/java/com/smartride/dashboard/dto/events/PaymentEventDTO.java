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
public class PaymentEventDTO implements Serializable {
    private String eventType; // PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_REFUNDED
    private String transactionId;
    private Long bookingId;
    private Long userId;
    private String userName;
    private Double amount;
    private Double platformCommission;
    private String paymentMethod; // FLOUCI, D17, CARTE, ESPECES
    private String status;
    private LocalDateTime timestamp;
}
