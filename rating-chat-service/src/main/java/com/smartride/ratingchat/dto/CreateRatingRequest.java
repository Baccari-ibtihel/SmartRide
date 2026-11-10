package com.smartride.ratingchat.dto;


import com.smartride.ratingchat.entities.RaterRole;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Le raterId n'est pas dans le corps : il vient de l'en-tete X-User-Id. */
public record CreateRatingRequest(
        @NotNull(message = "bookingId est obligatoire") @Positive Long bookingId,
        @NotNull(message = "tripId est obligatoire") @Positive Long tripId,
        @NotNull(message = "ratedUserId est obligatoire") @Positive Long ratedUserId,
        @NotNull(message = "raterRole est obligatoire (PASSENGER ou DRIVER)") RaterRole raterRole,
        @NotNull(message = "score est obligatoire")
        @Min(value = 1, message = "La note minimale est 1")
        @Max(value = 5, message = "La note maximale est 5") Integer score,
        @Size(max = 1000, message = "Le commentaire ne doit pas depasser 1000 caracteres") String comment) {
}
