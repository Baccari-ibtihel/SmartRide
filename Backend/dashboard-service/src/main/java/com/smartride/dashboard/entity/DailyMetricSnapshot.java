package com.smartride.dashboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_metric_snapshots", indexes = {
        @Index(name = "idx_snapshot_date", columnList = "metric_date", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyMetricSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metric_date", nullable = false, unique = true)
    private LocalDate metricDate;

    @Column(name = "total_users")
    private long totalUsers;

    @Column(name = "active_users")
    private long activeUsers;

    @Column(name = "new_users_today")
    private long newUsersToday;

    @Column(name = "total_trips_published")
    private long totalTripsPublished;

    @Column(name = "completed_trips")
    private long completedTrips;

    @Column(name = "cancelled_trips")
    private long cancelledTrips;

    @Column(name = "total_bookings")
    private long totalBookings;

    @Column(name = "confirmed_bookings")
    private long confirmedBookings;

    @Column(name = "total_revenue")
    private double totalRevenue;

    @Column(name = "platform_commission")
    private double platformCommission;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
