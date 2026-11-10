package com.smartride.ratingchat.services;


import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


import com.smartride.ratingchat.dto.CreateRatingRequest;
import com.smartride.ratingchat.dto.PageResponse;
import com.smartride.ratingchat.dto.RatingResponse;
import com.smartride.ratingchat.dto.RatingSummaryResponse;
import com.smartride.ratingchat.dto.RatingSummaryResponse.RoleSummary;
import com.smartride.ratingchat.dto.ScoreCount;
import com.smartride.ratingchat.dto.UpdateRatingRequest;
import com.smartride.ratingchat.entities.RaterRole;
import com.smartride.ratingchat.entities.Rating;
import com.smartride.ratingchat.exceptions.BusinessException;
import com.smartride.ratingchat.exceptions.ConflictException;
import com.smartride.ratingchat.exceptions.ForbiddenException;
import com.smartride.ratingchat.exceptions.ResourceNotFoundException;
import com.smartride.ratingchat.repositories.RatingRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RatingService {

    private final RatingRepository ratingRepository;
    private final BookingVerifier bookingVerifier;

    public RatingService(RatingRepository ratingRepository, BookingVerifier bookingVerifier) {
        this.ratingRepository = ratingRepository;
        this.bookingVerifier = bookingVerifier;
    }

    @Transactional
    public RatingResponse create(Long raterId, CreateRatingRequest request) {
        if (raterId.equals(request.ratedUserId())) {
            throw new BusinessException("Vous ne pouvez pas vous evaluer vous-meme");
        }
        if (ratingRepository.existsByBookingIdAndRaterId(request.bookingId(), raterId)) {
            throw new ConflictException("Vous avez deja evalue la reservation " + request.bookingId());
        }

        bookingVerifier.verify(raterId, request);

        Rating rating = new Rating();
        rating.setBookingId(request.bookingId());
        rating.setTripId(request.tripId());
        rating.setRaterId(raterId);
        rating.setRatedUserId(request.ratedUserId());
        rating.setRaterRole(request.raterRole());
        rating.setScore(request.score());
        rating.setComment(clean(request.comment()));
        return RatingResponse.from(ratingRepository.save(rating));
    }

    public RatingResponse getById(Long id) {
        return RatingResponse.from(findRating(id));
    }

    @Transactional
    public RatingResponse update(Long id, Long userId, UpdateRatingRequest request) {
        Rating rating = findOwnedRating(id, userId);
        rating.setScore(request.score());
        rating.setComment(clean(request.comment()));
        return RatingResponse.from(ratingRepository.saveAndFlush(rating));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        ratingRepository.delete(findOwnedRating(id, userId));
    }

    public PageResponse<RatingResponse> getReceivedBy(Long userId, Pageable pageable) {
        return PageResponse.from(ratingRepository.findByRatedUserId(userId, pageable).map(RatingResponse::from));
    }

    public PageResponse<RatingResponse> getGivenBy(Long userId, Pageable pageable) {
        return PageResponse.from(ratingRepository.findByRaterId(userId, pageable).map(RatingResponse::from));
    }

    public List<RatingResponse> getByTrip(Long tripId) {
        return ratingRepository.findByTripIdOrderByCreatedAtDesc(tripId).stream().map(RatingResponse::from).toList();
    }

    public List<RatingResponse> getByBooking(Long bookingId) {
        return ratingRepository.findByBookingId(bookingId).stream().map(RatingResponse::from).toList();
    }

    public RatingSummaryResponse getSummary(Long userId) {
        List<ScoreCount> counts = ratingRepository.countScoresReceivedBy(userId);

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 1; star <= 5; star++) {
            distribution.put(star, 0L);
        }
        counts.forEach(c -> distribution.merge(c.score(), c.total(), Long::sum));

        // Quand un PASSAGER note, la personne notee etait CONDUCTEUR (et inversement)
        RoleSummary asDriver = summarize(counts.stream().filter(c -> c.raterRole() == RaterRole.PASSENGER).toList());
        RoleSummary asPassenger = summarize(counts.stream().filter(c -> c.raterRole() == RaterRole.DRIVER).toList());
        RoleSummary overall = summarize(counts);

        return new RatingSummaryResponse(userId, overall.averageScore(), overall.totalRatings(),
                distribution, asDriver, asPassenger);
    }

    private static RoleSummary summarize(List<ScoreCount> counts) {
        long total = counts.stream().mapToLong(ScoreCount::total).sum();
        if (total == 0) {
            return new RoleSummary(0.0, 0);
        }
        long sum = counts.stream().mapToLong(c -> c.score() * c.total()).sum();
        double average = Math.round((double) sum / total * 100) / 100.0;
        return new RoleSummary(average, total);
    }

    private Rating findRating(Long id) {
        return ratingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation " + id + " introuvable"));
    }

    private Rating findOwnedRating(Long id, Long userId) {
        Rating rating = findRating(id);
        if (!rating.getRaterId().equals(userId)) {
            throw new ForbiddenException("Seul l'auteur de l'evaluation peut la modifier ou la supprimer");
        }
        return rating;
    }

    private static String clean(String comment) {
        return comment == null || comment.isBlank() ? null : comment.trim();
    }
}
