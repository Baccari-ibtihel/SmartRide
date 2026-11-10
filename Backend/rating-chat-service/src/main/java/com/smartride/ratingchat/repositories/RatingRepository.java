package com.smartride.ratingchat.repositories;


import java.util.List;


import com.smartride.ratingchat.dto.ScoreCount;
import com.smartride.ratingchat.entities.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    boolean existsByBookingIdAndRaterId(Long bookingId, Long raterId);

    Page<Rating> findByRatedUserId(Long ratedUserId, Pageable pageable);

    Page<Rating> findByRaterId(Long raterId, Pageable pageable);

    List<Rating> findByTripIdOrderByCreatedAtDesc(Long tripId);

    List<Rating> findByBookingId(Long bookingId);

    @Query("""
            select new com.smartride.ratingchat.dto.ScoreCount(r.raterRole, r.score, count(r))
            from Rating r
            where r.ratedUserId = :userId
            group by r.raterRole, r.score
            """)
    List<ScoreCount> countScoresReceivedBy(@Param("userId") Long userId);
}
