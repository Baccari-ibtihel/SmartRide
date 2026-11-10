package com.smartride.ratingchat.dto;


import java.time.LocalDateTime;


import com.smartride.ratingchat.entities.RaterRole;
import com.smartride.ratingchat.entities.Rating;

public record RatingResponse(
        Long id,
        Long bookingId,
        Long tripId,
        Long raterId,
        Long ratedUserId,
        RaterRole raterRole,
        int score,
        String comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static RatingResponse from(Rating rating) {
        return new RatingResponse(rating.getId(), rating.getBookingId(), rating.getTripId(),
                rating.getRaterId(), rating.getRatedUserId(), rating.getRaterRole(), rating.getScore(),
                rating.getComment(), rating.getCreatedAt(), rating.getUpdatedAt());
    }
}
