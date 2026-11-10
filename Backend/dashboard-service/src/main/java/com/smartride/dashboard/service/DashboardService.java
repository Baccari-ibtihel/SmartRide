package com.smartride.dashboard.service;

import com.smartride.dashboard.client.*;
import com.smartride.dashboard.dto.AuditLogRequestDTO;
import com.smartride.dashboard.dto.DashboardStatsDTO;
import com.smartride.dashboard.dto.SnapshotRangeRequestDTO;
import com.smartride.dashboard.dto.StatsFilterRequestDTO;
import com.smartride.dashboard.model.AuditLog;
import com.smartride.dashboard.model.MetricsSnapshot;
import com.smartride.dashboard.repository.AuditLogRepository;
import com.smartride.dashboard.repository.MetricsSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final UserServiceClient userServiceClient;
    private final TripServiceClient tripServiceClient;
    private final BookingServiceClient bookingServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final NotificationTrackingServiceClient notificationTrackingServiceClient;
    private final MetricsSnapshotRepository metricsSnapshotRepository;
    private final AuditLogRepository auditLogRepository;

    // ──────────────────────────────────────────────────────────
    //  GET — Statistiques live (tous services)
    // ──────────────────────────────────────────────────────────

    /**
     * Collect stats from all connected services and return aggregated dashboard data.
     */
    public DashboardStatsDTO getStats() {
        // Health checks
        String userStatus     = safeCall(() -> userServiceClient.health(), "DOWN");
        String tripStatus     = safeCall(() -> tripServiceClient.health(), "DOWN");
        String bookingStatus  = safeCall(() -> bookingServiceClient.health(), "DOWN");
        String paymentStatus  = safeCall(() -> paymentServiceClient.health(), "DOWN");
        String trackingStatus = safeCall(() -> notificationTrackingServiceClient.health(), "DOWN");

        // Statistics
        Map<String, Object> userStats     = safeMapCall(() -> userServiceClient.getUserStats());
        Map<String, Object> tripStats     = safeMapCall(() -> tripServiceClient.getTripStats());
        Map<String, Object> bookingStats  = safeMapCall(() -> bookingServiceClient.getBookingStats());
        Map<String, Object> paymentStats  = safeMapCall(() -> paymentServiceClient.getPaymentStats());
        Map<String, Object> trackingStats = safeMapCall(() -> notificationTrackingServiceClient.getTrackingStats());

        Long   totalUsers    = extractLong(userStats,    "totalUsers");
        Long   totalTrips    = extractLong(tripStats,    "totalTrips");
        Long   totalBookings = extractLong(bookingStats, "totalBookings");
        Double totalRevenue  = extractDouble(paymentStats, "totalRevenue");

        return DashboardStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalTrips(totalTrips)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .userStats(userStats)
                .tripStats(tripStats)
                .bookingStats(bookingStats)
                .paymentStats(paymentStats)
                .trackingStats(trackingStats)
                .userServiceStatus(userStatus)
                .tripServiceStatus(tripStatus)
                .bookingServiceStatus(bookingStatus)
                .paymentServiceStatus(paymentStatus)
                .notificationTrackingServiceStatus(trackingStatus)
                .build();
    }

    // ──────────────────────────────────────────────────────────
    //  GET — Dernier snapshot
    // ──────────────────────────────────────────────────────────

    public MetricsSnapshot getLatestSnapshot() {
        return metricsSnapshotRepository.findTopByOrderBySnapshotTimeDesc().orElse(null);
    }

    // ──────────────────────────────────────────────────────────
    //  POST — Snapshot : créer
    // ──────────────────────────────────────────────────────────

    /**
     * Take a snapshot of the current metrics and persist it to MySQL.
     */
    public MetricsSnapshot takeSnapshot() {
        DashboardStatsDTO stats = getStats();

        MetricsSnapshot snapshot = MetricsSnapshot.builder()
                .snapshotTime(LocalDateTime.now())
                .totalUsers(stats.getTotalUsers())
                .totalTrips(stats.getTotalTrips())
                .totalBookings(stats.getTotalBookings())
                .totalRevenue(stats.getTotalRevenue())
                .build();

        MetricsSnapshot saved = metricsSnapshotRepository.save(snapshot);
        log.info("Snapshot créé avec ID={} à {}", saved.getId(), saved.getSnapshotTime());
        return saved;
    }

    // ──────────────────────────────────────────────────────────
    //  POST — Statistiques filtrées par période et seuils
    // ──────────────────────────────────────────────────────────

    /**
     * Returns persisted snapshots matching the given filter criteria
     * (date range + optional revenue/user thresholds).
     */
    public List<MetricsSnapshot> filterStats(StatsFilterRequestDTO filter) {
        LocalDateTime from = filter.getStartDate() != null
                ? filter.getStartDate()
                : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime to = filter.getEndDate() != null
                ? filter.getEndDate()
                : LocalDateTime.now();

        List<MetricsSnapshot> snapshots =
                metricsSnapshotRepository.findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc(from, to);

        if (filter.getMinRevenue() != null) {
            snapshots = snapshots.stream()
                    .filter(s -> s.getTotalRevenue() != null && s.getTotalRevenue() >= filter.getMinRevenue())
                    .toList();
        }
        if (filter.getMinUsers() != null) {
            snapshots = snapshots.stream()
                    .filter(s -> s.getTotalUsers() != null && s.getTotalUsers() >= filter.getMinUsers())
                    .toList();
        }

        log.info("filterStats: {} snapshot(s) correspondent au filtre", snapshots.size());
        return snapshots;
    }

    // ──────────────────────────────────────────────────────────
    //  POST — Snapshots dans une plage de dates
    // ──────────────────────────────────────────────────────────

    /**
     * Returns all snapshots between request.from and request.to (ordered desc).
     */
    public List<MetricsSnapshot> getSnapshotsByRange(SnapshotRangeRequestDTO request) {
        LocalDateTime from = request.getFrom() != null
                ? request.getFrom()
                : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime to = request.getTo() != null
                ? request.getTo()
                : LocalDateTime.now();

        List<MetricsSnapshot> results =
                metricsSnapshotRepository.findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc(from, to);

        log.info("getSnapshotsByRange: {} snapshot(s) trouvés entre {} et {}", results.size(), from, to);
        return results;
    }

    // ──────────────────────────────────────────────────────────
    //  POST — Journal d'audit admin
    // ──────────────────────────────────────────────────────────

    /**
     * Create and persist an admin audit log entry.
     */
    public AuditLog createAuditLog(AuditLogRequestDTO request) {
        AuditLog entry = AuditLog.builder()
                .adminId(request.getAdminId())
                .action(request.getAction())
                .details(request.getDetails())
                .module(request.getModule() != null ? request.getModule() : "DASHBOARD")
                .timestamp(LocalDateTime.now())
                .build();

        AuditLog saved = auditLogRepository.save(entry);
        log.info("AuditLog créé: admin={} action={} module={}", saved.getAdminId(), saved.getAction(), saved.getModule());
        return saved;
    }

    // ──────────────────────────────────────────────────────────
    //  POST — Supprimer anciens snapshots
    // ──────────────────────────────────────────────────────────

    /**
     * Delete all snapshots strictly before the given date.
     * Returns the count of deleted records.
     */
    public int deleteSnapshotsBefore(LocalDateTime before) {
        int deleted = metricsSnapshotRepository.deleteBySnapshotTimeBefore(before);
        log.warn("Suppression de {} snapshot(s) antérieurs à {}", deleted, before);
        return deleted;
    }

    // ──────────────────────────────────────────────────────────
    //  GET — Tous les snapshots
    // ──────────────────────────────────────────────────────────

    /**
     * Returns all snapshots ordered by most recent first.
     */
    public List<MetricsSnapshot> getAllSnapshots() {
        List<MetricsSnapshot> list = metricsSnapshotRepository
                .findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc(
                        LocalDateTime.of(2000, 1, 1, 0, 0),
                        LocalDateTime.now().plusDays(1));
        log.info("getAllSnapshots: {} snapshot(s) en base", list.size());
        return list;
    }

    // ──────────────────────────────────────────────────────────
    //  GET — Audit logs : tous
    // ──────────────────────────────────────────────────────────

    /**
     * Returns all audit log entries ordered by most recent first.
     */
    public List<AuditLog> getAllAuditLogs() {
        List<AuditLog> list = auditLogRepository.findAllByOrderByTimestampDesc();
        log.info("getAllAuditLogs: {} entrée(s) trouvée(s)", list.size());
        return list;
    }

    // ──────────────────────────────────────────────────────────
    //  GET — Audit logs : par adminId
    // ──────────────────────────────────────────────────────────

    /**
     * Returns all audit logs for a given admin, ordered by most recent first.
     */
    public List<AuditLog> getAuditLogsByAdmin(String adminId) {
        List<AuditLog> list = auditLogRepository.findByAdminId(adminId);
        log.info("getAuditLogsByAdmin({}): {} entrée(s)", adminId, list.size());
        return list;
    }

    // ──────────────────────────────────────────────────────────
    //  GET — Audit logs : par module
    // ──────────────────────────────────────────────────────────

    /**
     * Returns all audit logs for a given module, ordered by most recent first.
     */
    public List<AuditLog> getAuditLogsByModule(String module) {
        List<AuditLog> list = auditLogRepository.findByModule(module);
        log.info("getAuditLogsByModule({}): {} entrée(s)", module, list.size());
        return list;
    }

    // ──────────────────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────────────────

    private String safeCall(java.util.function.Supplier<String> call, String fallback) {
        try { return call.get(); }
        catch (Exception e) { log.warn("Service call failed: {}", e.getMessage()); return fallback; }
    }

    private Map<String, Object> safeMapCall(java.util.function.Supplier<Map<String, Object>> call) {
        try { return call.get(); }
        catch (Exception e) {
            log.warn("Service stats call failed: {}", e.getMessage());
            return java.util.Collections.singletonMap("error", e.getMessage());
        }
    }

    private Long extractLong(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return null;
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).longValue();
        try { return Long.parseLong(val.toString()); } catch (Exception e) { return null; }
    }

    private Double extractDouble(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return null;
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return null; }
    }
}
