package com.smartride.ratingchat.entities;


import java.time.LocalDateTime;


import com.smartride.ratingchat.utils.Timestamps;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Evaluation laissee apres un trajet.
 * Une reservation (booking) relie un passager et un conducteur : chacun peut noter l'autre une seule fois.
 * Les identifiants (bookingId, tripId, userId...) viennent des autres microservices.
 */
@Entity
@Table(name = "ratings",
        uniqueConstraints = @UniqueConstraint(name = "uk_rating_booking_rater", columnNames = {"booking_id", "rater_id"}),
        indexes = {
                @Index(name = "idx_rating_rated_user", columnList = "rated_user_id"),
                @Index(name = "idx_rating_trip", columnList = "trip_id")
        })
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private Long tripId;

    /** Celui qui donne la note. */
    @Column(nullable = false)
    private Long raterId;

    /** Celui qui recoit la note. */
    @Column(nullable = false)
    private Long ratedUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RaterRole raterRole;

    /** Note de 1 a 5. */
    @Column(nullable = false)
    private int score;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Timestamps.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Timestamps.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public Long getRaterId() {
        return raterId;
    }

    public void setRaterId(Long raterId) {
        this.raterId = raterId;
    }

    public Long getRatedUserId() {
        return ratedUserId;
    }

    public void setRatedUserId(Long ratedUserId) {
        this.ratedUserId = ratedUserId;
    }

    public RaterRole getRaterRole() {
        return raterRole;
    }

    public void setRaterRole(RaterRole raterRole) {
        this.raterRole = raterRole;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
