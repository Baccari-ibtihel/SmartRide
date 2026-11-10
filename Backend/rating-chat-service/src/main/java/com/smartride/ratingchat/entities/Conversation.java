package com.smartride.ratingchat.entities;


import java.time.LocalDateTime;


import com.smartride.ratingchat.utils.Timestamps;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Discussion privee entre un passager et le conducteur d'un trajet.
 * Une seule conversation par (trajet, passager, conducteur).
 */
@Entity
@Table(name = "conversations",
        uniqueConstraints = @UniqueConstraint(name = "uk_conversation_trip_participants",
                columnNames = {"trip_id", "passenger_id", "driver_id"}),
        indexes = {
                @Index(name = "idx_conversation_passenger", columnList = "passenger_id"),
                @Index(name = "idx_conversation_driver", columnList = "driver_id")
        })
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long tripId;

    @Column(nullable = false)
    private Long passengerId;

    @Column(nullable = false)
    private Long driverId;

    /** Apercu du dernier message, pour la liste des conversations. */
    @Column(length = 255)
    private String lastMessagePreview;

    private LocalDateTime lastMessageAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Timestamps.now();
    }

    public boolean hasParticipant(Long userId) {
        return passengerId.equals(userId) || driverId.equals(userId);
    }

    /** L'autre personne de la conversation (le destinataire d'un message de userId). */
    public Long otherParticipant(Long userId) {
        return passengerId.equals(userId) ? driverId : passengerId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public Long getPassengerId() {
        return passengerId;
    }

    public void setPassengerId(Long passengerId) {
        this.passengerId = passengerId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public String getLastMessagePreview() {
        return lastMessagePreview;
    }

    public void setLastMessagePreview(String lastMessagePreview) {
        this.lastMessagePreview = lastMessagePreview;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
