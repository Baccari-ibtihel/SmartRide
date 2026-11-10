package com.smartride.dashboard.service;

import com.smartride.dashboard.config.RabbitMQConfig;
import com.smartride.dashboard.dto.events.*;
import com.smartride.dashboard.model.AuditLog;
import com.smartride.dashboard.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Asynchronous Event Consumer for Dashboard Service.
 * Listens to RabbitMQ queues populated by microservices and records audit trails
 * as well as real-time dashboard events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardRabbitMQConsumer {

    private final AuditLogRepository auditLogRepository;

    // ─────────────────────────────────────────────────────────
    //  1. User Events Listener
    // ─────────────────────────────────────────────────────────
    @RabbitListener(queues = RabbitMQConfig.QUEUE_DASHBOARD_USERS)
    public void handleUserEvent(UserEventDTO event) {
        log.info("RabbitMQ: User event received [type={}, userId={}, email={}]",
                event.getEventType(), event.getUserId(), event.getEmail());

        AuditLog audit = AuditLog.builder()
                .adminId("SYSTEM-RABBITMQ")
                .action(event.getEventType() != null ? event.getEventType() : "USER_EVENT")
                .module("USERS")
                .details(String.format("Utilisateur #%d (%s, %s) traité via RabbitMQ",
                        event.getUserId(), event.getFullName(), event.getRole()))
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now())
                .build();

        auditLogRepository.save(audit);
    }

    // ─────────────────────────────────────────────────────────
    //  2. Trip Events Listener
    // ─────────────────────────────────────────────────────────
    @RabbitListener(queues = RabbitMQConfig.QUEUE_DASHBOARD_TRIPS)
    public void handleTripEvent(TripEventDTO event) {
        log.info("RabbitMQ: Trip event received [type={}, tripId={}, route={} -> {}]",
                event.getEventType(), event.getTripId(), event.getOrigin(), event.getDestination());

        AuditLog audit = AuditLog.builder()
                .adminId("SYSTEM-RABBITMQ")
                .action(event.getEventType() != null ? event.getEventType() : "TRIP_EVENT")
                .module("TRIPS")
                .details(String.format("Trajet #%d par %s: %s -> %s (Score IA: %s%%)",
                        event.getTripId(), event.getDriverName(), event.getOrigin(), event.getDestination(),
                        event.getIaMatchScore() != null ? event.getIaMatchScore() : "N/A"))
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now())
                .build();

        auditLogRepository.save(audit);
    }

    // ─────────────────────────────────────────────────────────
    //  3. Booking Events Listener
    // ─────────────────────────────────────────────────────────
    @RabbitListener(queues = RabbitMQConfig.QUEUE_DASHBOARD_BOOKINGS)
    public void handleBookingEvent(BookingEventDTO event) {
        log.info("RabbitMQ: Booking event received [type={}, bookingId={}, status={}]",
                event.getEventType(), event.getBookingId(), event.getStatus());

        AuditLog audit = AuditLog.builder()
                .adminId("SYSTEM-RABBITMQ")
                .action(event.getEventType() != null ? event.getEventType() : "BOOKING_EVENT")
                .module("BOOKINGS")
                .details(String.format("Réservation #%d: Passager=%s, Places=%d, Total=%.2f TND",
                        event.getBookingId(), event.getPassengerName(), event.getSeats(), event.getTotalPrice()))
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now())
                .build();

        auditLogRepository.save(audit);
    }

    // ─────────────────────────────────────────────────────────
    //  4. Payment Events Listener
    // ─────────────────────────────────────────────────────────
    @RabbitListener(queues = RabbitMQConfig.QUEUE_DASHBOARD_PAYMENTS)
    public void handlePaymentEvent(PaymentEventDTO event) {
        log.info("RabbitMQ: Payment event received [txnId={}, amount={} TND, method={}]",
                event.getTransactionId(), event.getAmount(), event.getPaymentMethod());

        AuditLog audit = AuditLog.builder()
                .adminId("SYSTEM-RABBITMQ")
                .action(event.getEventType() != null ? event.getEventType() : "PAYMENT_EVENT")
                .module("PAYMENTS")
                .details(String.format("Paiement #%s: %.2f TND via %s (Commission: %.2f TND)",
                        event.getTransactionId(), event.getAmount(), event.getPaymentMethod(),
                        event.getPlatformCommission() != null ? event.getPlatformCommission() : 0.0))
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now())
                .build();

        auditLogRepository.save(audit);
    }

    // ─────────────────────────────────────────────────────────
    //  5. Direct Audit Events Listener
    // ─────────────────────────────────────────────────────────
    @RabbitListener(queues = RabbitMQConfig.QUEUE_DASHBOARD_AUDIT)
    public void handleAuditEvent(AuditEventDTO event) {
        log.info("RabbitMQ: Audit log event received [adminId={}, action={}, module={}]",
                event.getAdminId(), event.getAction(), event.getModule());

        AuditLog audit = AuditLog.builder()
                .adminId(event.getAdminId() != null ? event.getAdminId() : "ANONYMOUS")
                .action(event.getAction())
                .module(event.getModule() != null ? event.getModule() : "DASHBOARD")
                .details(event.getDetails())
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now())
                .build();

        auditLogRepository.save(audit);
    }
}
