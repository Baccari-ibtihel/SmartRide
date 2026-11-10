package com.smartride.ratingchat.dto;

/**
 * Reponse attendue de GET http://booking-service/api/bookings/{id}.
 * Contrat a valider avec l'equipe du Booking Service (les champs inconnus sont ignores).
 */
public record BookingDto(
        Long id,
        Long tripId,
        Long passengerId,
        Long driverId,
        String status) {
}
