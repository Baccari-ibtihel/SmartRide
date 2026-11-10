package com.smartride.ratingchat.dto;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateRatingRequest(
        @NotNull(message = "score est obligatoire")
        @Min(value = 1, message = "La note minimale est 1")
        @Max(value = 5, message = "La note maximale est 5") Integer score,
        @Size(max = 1000, message = "Le commentaire ne doit pas depasser 1000 caracteres") String comment) {
}
