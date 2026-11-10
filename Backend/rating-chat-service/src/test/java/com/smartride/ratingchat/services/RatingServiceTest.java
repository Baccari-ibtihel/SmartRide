package com.smartride.ratingchat.services;


import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


import java.util.List;
import java.util.Optional;


import com.smartride.ratingchat.dto.CreateRatingRequest;
import com.smartride.ratingchat.dto.RatingResponse;
import com.smartride.ratingchat.dto.RatingSummaryResponse;
import com.smartride.ratingchat.dto.ScoreCount;
import com.smartride.ratingchat.dto.UpdateRatingRequest;
import com.smartride.ratingchat.entities.RaterRole;
import com.smartride.ratingchat.entities.Rating;
import com.smartride.ratingchat.exceptions.BusinessException;
import com.smartride.ratingchat.exceptions.ConflictException;
import com.smartride.ratingchat.exceptions.ForbiddenException;
import com.smartride.ratingchat.repositories.RatingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private BookingVerifier bookingVerifier;

    @InjectMocks
    private RatingService ratingService;

    @Test
    void create_savesRatingOfTheConnectedUser() {
        CreateRatingRequest request = new CreateRatingRequest(10L, 100L, 2L, RaterRole.PASSENGER, 5, "  Super trajet  ");
        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RatingResponse response = ratingService.create(1L, request);

        assertThat(response.raterId()).isEqualTo(1L);
        assertThat(response.ratedUserId()).isEqualTo(2L);
        assertThat(response.score()).isEqualTo(5);
        assertThat(response.comment()).isEqualTo("Super trajet");
        verify(bookingVerifier).verify(1L, request);
    }

    @Test
    void create_rejectsSelfRating() {
        CreateRatingRequest request = new CreateRatingRequest(10L, 100L, 1L, RaterRole.PASSENGER, 4, null);

        assertThatThrownBy(() -> ratingService.create(1L, request)).isInstanceOf(BusinessException.class);
        verify(ratingRepository, never()).save(any());
    }

    @Test
    void create_rejectsSecondRatingForSameBooking() {
        CreateRatingRequest request = new CreateRatingRequest(10L, 100L, 2L, RaterRole.PASSENGER, 4, null);
        when(ratingRepository.existsByBookingIdAndRaterId(10L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> ratingService.create(1L, request)).isInstanceOf(ConflictException.class);
        verify(ratingRepository, never()).save(any());
    }

    @Test
    void update_rejectsUserWhoIsNotTheAuthor() {
        Rating rating = new Rating();
        rating.setId(7L);
        rating.setRaterId(1L);
        when(ratingRepository.findById(7L)).thenReturn(Optional.of(rating));

        assertThatThrownBy(() -> ratingService.update(7L, 99L, new UpdateRatingRequest(1, "x")))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void summary_computesAverageDistributionAndRoles() {
        when(ratingRepository.countScoresReceivedBy(2L)).thenReturn(List.of(
                new ScoreCount(RaterRole.PASSENGER, 5, 3L),   // 3 x 5 etoiles en tant que conducteur
                new ScoreCount(RaterRole.PASSENGER, 4, 1L),   // 1 x 4 etoiles en tant que conducteur
                new ScoreCount(RaterRole.DRIVER, 3, 1L)));    // 1 x 3 etoiles en tant que passager

        RatingSummaryResponse summary = ratingService.getSummary(2L);

        assertThat(summary.totalRatings()).isEqualTo(5);
        assertThat(summary.averageScore()).isEqualTo(4.4);
        assertThat(summary.distribution()).containsEntry(1, 0L).containsEntry(3, 1L).containsEntry(5, 3L);
        assertThat(summary.asDriver().averageScore()).isEqualTo(4.75);
        assertThat(summary.asDriver().totalRatings()).isEqualTo(4);
        assertThat(summary.asPassenger().averageScore()).isEqualTo(3.0);
    }

    @Test
    void summary_isZeroWhenNoRatings() {
        when(ratingRepository.countScoresReceivedBy(3L)).thenReturn(List.of());

        RatingSummaryResponse summary = ratingService.getSummary(3L);

        assertThat(summary.totalRatings()).isZero();
        assertThat(summary.averageScore()).isZero();
        assertThat(summary.distribution()).hasSize(5);
    }
}
