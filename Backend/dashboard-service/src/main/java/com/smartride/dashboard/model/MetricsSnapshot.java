package com.smartride.dashboard.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "metrics_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricsSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "snapshot_time", nullable = false)
    private LocalDateTime snapshotTime;

    // User statistics
    @Column(name = "total_users")
    private Long totalUsers;

    @Column(name = "new_users_today")
    private Long newUsersToday;

    // Trip statistics
    @Column(name = "total_trips")
    private Long totalTrips;

    @Column(name = "active_trips")
    private Long activeTrips;

    @Column(name = "completed_trips")
    private Long completedTrips;

    // Booking statistics
    @Column(name = "total_bookings")
    private Long totalBookings;

    @Column(name = "pending_bookings")
    private Long pendingBookings;

    @Column(name = "confirmed_bookings")
    private Long confirmedBookings;

    @Column(name = "cancelled_bookings")
    private Long cancelledBookings;

    // Payment / Revenue statistics
    @Column(name = "total_revenue")
    private Double totalRevenue;

    @Column(name = "revenue_today")
    private Double revenueToday;

    @PrePersist
    public void prePersist() {
        if (snapshotTime == null) {
            snapshotTime = LocalDateTime.now();
        }
    }
}
