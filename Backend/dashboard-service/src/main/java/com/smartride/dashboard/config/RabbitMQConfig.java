package com.smartride.dashboard.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ Configuration for SmartRide Dashboard Service.
 * Implements Event-Driven Architecture (EDA) to consume events published by
 * User Service, Trip Service, Booking Service, Payment Service, etc.
 */
@Configuration
public class RabbitMQConfig {

    // Main Topic Exchange
    public static final String SMARTRIDE_EXCHANGE = "smartride.exchange";

    // Queues
    public static final String QUEUE_DASHBOARD_USERS = "smartride.dashboard.users.queue";
    public static final String QUEUE_DASHBOARD_TRIPS = "smartride.dashboard.trips.queue";
    public static final String QUEUE_DASHBOARD_BOOKINGS = "smartride.dashboard.bookings.queue";
    public static final String QUEUE_DASHBOARD_PAYMENTS = "smartride.dashboard.payments.queue";
    public static final String QUEUE_DASHBOARD_AUDIT = "smartride.dashboard.audit.queue";

    // Routing Keys
    public static final String ROUTING_KEY_USER = "user.#";
    public static final String ROUTING_KEY_TRIP = "trip.#";
    public static final String ROUTING_KEY_BOOKING = "booking.#";
    public static final String ROUTING_KEY_PAYMENT = "payment.#";
    public static final String ROUTING_KEY_AUDIT = "audit.#";

    // ─────────────────────────────────────────────────────────
    //  Exchange
    // ─────────────────────────────────────────────────────────

    @Bean
    public TopicExchange smartrideExchange() {
        return new TopicExchange(SMARTRIDE_EXCHANGE, true, false);
    }

    // ─────────────────────────────────────────────────────────
    //  Queues (Durable)
    // ─────────────────────────────────────────────────────────

    @Bean
    public Queue userEventsQueue() {
        return QueueBuilder.durable(QUEUE_DASHBOARD_USERS).build();
    }

    @Bean
    public Queue tripEventsQueue() {
        return QueueBuilder.durable(QUEUE_DASHBOARD_TRIPS).build();
    }

    @Bean
    public Queue bookingEventsQueue() {
        return QueueBuilder.durable(QUEUE_DASHBOARD_BOOKINGS).build();
    }

    @Bean
    public Queue paymentEventsQueue() {
        return QueueBuilder.durable(QUEUE_DASHBOARD_PAYMENTS).build();
    }

    @Bean
    public Queue auditEventsQueue() {
        return QueueBuilder.durable(QUEUE_DASHBOARD_AUDIT).build();
    }

    // ─────────────────────────────────────────────────────────
    //  Bindings
    // ─────────────────────────────────────────────────────────

    @Bean
    public Binding bindingUserEvents(Queue userEventsQueue, TopicExchange smartrideExchange) {
        return BindingBuilder.bind(userEventsQueue).to(smartrideExchange).with(ROUTING_KEY_USER);
    }

    @Bean
    public Binding bindingTripEvents(Queue tripEventsQueue, TopicExchange smartrideExchange) {
        return BindingBuilder.bind(tripEventsQueue).to(smartrideExchange).with(ROUTING_KEY_TRIP);
    }

    @Bean
    public Binding bindingBookingEvents(Queue bookingEventsQueue, TopicExchange smartrideExchange) {
        return BindingBuilder.bind(bookingEventsQueue).to(smartrideExchange).with(ROUTING_KEY_BOOKING);
    }

    @Bean
    public Binding bindingPaymentEvents(Queue paymentEventsQueue, TopicExchange smartrideExchange) {
        return BindingBuilder.bind(paymentEventsQueue).to(smartrideExchange).with(ROUTING_KEY_PAYMENT);
    }

    @Bean
    public Binding bindingAuditEvents(Queue auditEventsQueue, TopicExchange smartrideExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(smartrideExchange).with(ROUTING_KEY_AUDIT);
    }

    // ─────────────────────────────────────────────────────────
    //  JSON Message Converter with Java 8 LocalDateTime support
    // ─────────────────────────────────────────────────────────

    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return new Jackson2JsonMessageConverter(mapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
