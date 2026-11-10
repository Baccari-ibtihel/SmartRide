package com.smartride.ratingchat.services;


import com.smartride.ratingchat.clients.BookingClient;
import com.smartride.ratingchat.config.BookingVerificationProperties;
import com.smartride.ratingchat.dto.BookingDto;
import com.smartride.ratingchat.dto.CreateRatingRequest;
import com.smartride.ratingchat.entities.RaterRole;
import com.smartride.ratingchat.exceptions.BusinessException;
import com.smartride.ratingchat.exceptions.ForbiddenException;
import org.springframework.stereotype.Component;

/**
 * Verifie aupres du Booking Service qu'une evaluation est legitime :
 * reservation terminee, et les deux utilisateurs sont bien le passager et le conducteur de cette reservation.
 * Desactive par defaut tant que le Booking Service n'est pas pret (smartride.booking-verification.enabled).
 */
@Component
public class BookingVerifier {

    private final BookingClient bookingClient;
    private final BookingVerificationProperties properties;

    public BookingVerifier(BookingClient bookingClient, BookingVerificationProperties properties) {
        this.bookingClient = bookingClient;
        this.properties = properties;
    }

    public void verify(Long raterId, CreateRatingRequest request) {
        if (!properties.enabled()) {
            return;
        }

        BookingDto booking = bookingClient.getBooking(request.bookingId());

        if (!request.tripId().equals(booking.tripId())) {
            throw new BusinessException("La reservation " + booking.id() + " ne correspond pas au trajet " + request.tripId());
        }
        if (booking.status() == null || !properties.allowedStatuses().contains(booking.status().toUpperCase())) {
            throw new BusinessException("Le trajet doit etre termine avant de pouvoir etre evalue (statut actuel : "
                    + booking.status() + ")");
        }

        Long expectedRater = request.raterRole() == RaterRole.PASSENGER ? booking.passengerId() : booking.driverId();
        Long expectedRated = request.raterRole() == RaterRole.PASSENGER ? booking.driverId() : booking.passengerId();
        if (!raterId.equals(expectedRater) || !request.ratedUserId().equals(expectedRated)) {
            throw new ForbiddenException("Vous ne faites pas partie de cette reservation");
        }
    }
}
