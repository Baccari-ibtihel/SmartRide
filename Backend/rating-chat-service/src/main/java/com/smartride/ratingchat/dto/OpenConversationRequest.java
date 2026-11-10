package com.smartride.ratingchat.dto;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** L'utilisateur connecte (X-User-Id) doit etre le passager ou le conducteur. */
public record OpenConversationRequest(
        @NotNull(message = "tripId est obligatoire") @Positive Long tripId,
        @NotNull(message = "passengerId est obligatoire") @Positive Long passengerId,
        @NotNull(message = "driverId est obligatoire") @Positive Long driverId) {
}
