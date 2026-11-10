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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * ✅ Tests Service — utilise Mockito pour simuler la BDD et les Feign clients.
 * Pas besoin de MySQL ni de H2 ici — tout est simulé (mock).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("⚙️ Tests Service — DashboardService")
class DashboardServiceTest {

    // ── Mocks (objets simulés, pas de vraie BDD) ──
    @Mock private UserServiceClient userServiceClient;
    @Mock private TripServiceClient tripServiceClient;
    @Mock private BookingServiceClient bookingServiceClient;
    @Mock private PaymentServiceClient paymentServiceClient;
    @Mock private NotificationTrackingServiceClient notificationTrackingServiceClient;
    @Mock private MetricsSnapshotRepository snapshotRepository;
    @Mock private AuditLogRepository auditLogRepository;

    // ── Le vrai service, injecté avec les mocks ──
    @InjectMocks
    private DashboardService dashboardService;

    // ─────────────────────────────────────────────────────────
    //  Tests getStats()
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ getStats() — tous les services UP, retourne les bonnes stats")
    void testGetStats_AllServicesUp() {
        // ARRANGE — Simuler les réponses des services Feign
        when(userServiceClient.health()).thenReturn("UP");
        when(tripServiceClient.health()).thenReturn("UP");
        when(bookingServiceClient.health()).thenReturn("UP");
        when(paymentServiceClient.health()).thenReturn("UP");
        when(notificationTrackingServiceClient.health()).thenReturn("UP");

        when(userServiceClient.getUserStats()).thenReturn(Map.of("totalUsers", 150));
        when(tripServiceClient.getTripStats()).thenReturn(Map.of("totalTrips", 80));
        when(bookingServiceClient.getBookingStats()).thenReturn(Map.of("totalBookings", 200));
        when(paymentServiceClient.getPaymentStats()).thenReturn(Map.of("totalRevenue", 4500.0));
        when(notificationTrackingServiceClient.getTrackingStats()).thenReturn(Map.of("totalEvents", 300));

        // ACT
        DashboardStatsDTO stats = dashboardService.getStats();

        // ASSERT
        assertThat(stats).isNotNull();
        assertThat(stats.getTotalUsers()).isEqualTo(150L);
        assertThat(stats.getTotalTrips()).isEqualTo(80L);
        assertThat(stats.getTotalBookings()).isEqualTo(200L);
        assertThat(stats.getTotalRevenue()).isEqualTo(4500.0);
        assertThat(stats.getUserServiceStatus()).isEqualTo("UP");
        assertThat(stats.getTripServiceStatus()).isEqualTo("UP");
    }

    @Test
    @DisplayName("✅ getStats() — un service DOWN → fallback gracieux, pas d'exception")
    void testGetStats_OneServiceDown() {
        // ARRANGE — user-service lève une exception
        when(userServiceClient.health()).thenThrow(new RuntimeException("Connection refused"));
        when(userServiceClient.getUserStats()).thenThrow(new RuntimeException("Connection refused"));

        // Les autres services répondent normalement
        when(tripServiceClient.health()).thenReturn("UP");
        when(bookingServiceClient.health()).thenReturn("UP");
        when(paymentServiceClient.health()).thenReturn("UP");
        when(notificationTrackingServiceClient.health()).thenReturn("UP");
        when(tripServiceClient.getTripStats()).thenReturn(Map.of("totalTrips", 50));
        when(bookingServiceClient.getBookingStats()).thenReturn(Map.of("totalBookings", 100));
        when(paymentServiceClient.getPaymentStats()).thenReturn(Map.of("totalRevenue", 2000.0));
        when(notificationTrackingServiceClient.getTrackingStats()).thenReturn(Map.of());

        // ACT — Ne doit pas lever d'exception
        DashboardStatsDTO stats = dashboardService.getStats();

        // ASSERT — user-service en DOWN, les autres UP
        assertThat(stats).isNotNull();
        assertThat(stats.getUserServiceStatus()).isEqualTo("DOWN");
        assertThat(stats.getTotalUsers()).isNull();
        assertThat(stats.getTripServiceStatus()).isEqualTo("UP");
        assertThat(stats.getTotalTrips()).isEqualTo(50L);
    }

    @Test
    @DisplayName("✅ getStats() — tous les services DOWN → stats null mais pas d'exception")
    void testGetStats_AllServicesDown() {
        // ARRANGE — Tous les services lèvent des exceptions
        when(userServiceClient.health()).thenThrow(new RuntimeException("DOWN"));
        when(tripServiceClient.health()).thenThrow(new RuntimeException("DOWN"));
        when(bookingServiceClient.health()).thenThrow(new RuntimeException("DOWN"));
        when(paymentServiceClient.health()).thenThrow(new RuntimeException("DOWN"));
        when(notificationTrackingServiceClient.health()).thenThrow(new RuntimeException("DOWN"));
        when(userServiceClient.getUserStats()).thenThrow(new RuntimeException("DOWN"));
        when(tripServiceClient.getTripStats()).thenThrow(new RuntimeException("DOWN"));
        when(bookingServiceClient.getBookingStats()).thenThrow(new RuntimeException("DOWN"));
        when(paymentServiceClient.getPaymentStats()).thenThrow(new RuntimeException("DOWN"));
        when(notificationTrackingServiceClient.getTrackingStats()).thenThrow(new RuntimeException("DOWN"));

        // ACT
        DashboardStatsDTO stats = dashboardService.getStats();

        // ASSERT — Service ne crash pas, tous en DOWN
        assertThat(stats).isNotNull();
        assertThat(stats.getUserServiceStatus()).isEqualTo("DOWN");
        assertThat(stats.getTripServiceStatus()).isEqualTo("DOWN");
        assertThat(stats.getTotalUsers()).isNull();
        assertThat(stats.getTotalRevenue()).isNull();
    }

    // ─────────────────────────────────────────────────────────
    //  Tests takeSnapshot()
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ takeSnapshot() — crée et sauvegarde un snapshot en BDD")
    void testTakeSnapshot() {
        // ARRANGE — Simuler les services
        when(userServiceClient.health()).thenReturn("UP");
        when(tripServiceClient.health()).thenReturn("UP");
        when(bookingServiceClient.health()).thenReturn("UP");
        when(paymentServiceClient.health()).thenReturn("UP");
        when(notificationTrackingServiceClient.health()).thenReturn("UP");
        when(userServiceClient.getUserStats()).thenReturn(Map.of("totalUsers", 100));
        when(tripServiceClient.getTripStats()).thenReturn(Map.of("totalTrips", 60));
        when(bookingServiceClient.getBookingStats()).thenReturn(Map.of("totalBookings", 150));
        when(paymentServiceClient.getPaymentStats()).thenReturn(Map.of("totalRevenue", 3000.0));
        when(notificationTrackingServiceClient.getTrackingStats()).thenReturn(Map.of());

        // Simuler save() → retourne un snapshot avec ID=1
        MetricsSnapshot savedSnapshot = MetricsSnapshot.builder()
                .id(1L)
                .snapshotTime(LocalDateTime.now())
                .totalUsers(100L)
                .totalTrips(60L)
                .totalBookings(150L)
                .totalRevenue(3000.0)
                .build();
        when(snapshotRepository.save(any(MetricsSnapshot.class))).thenReturn(savedSnapshot);

        // ACT
        MetricsSnapshot result = dashboardService.takeSnapshot();

        // ASSERT
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTotalUsers()).isEqualTo(100L);
        assertThat(result.getTotalRevenue()).isEqualTo(3000.0);

        // Vérifier que save() a bien été appelé une fois
        verify(snapshotRepository, times(1)).save(any(MetricsSnapshot.class));
    }

    // ─────────────────────────────────────────────────────────
    //  Tests getLatestSnapshot()
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ getLatestSnapshot() — retourne le dernier snapshot si présent")
    void testGetLatestSnapshot_Found() {
        // ARRANGE
        MetricsSnapshot snap = MetricsSnapshot.builder()
                .id(5L).totalUsers(200L).snapshotTime(LocalDateTime.now()).build();
        when(snapshotRepository.findTopByOrderBySnapshotTimeDesc()).thenReturn(Optional.of(snap));

        // ACT
        MetricsSnapshot result = dashboardService.getLatestSnapshot();

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(5L);
        assertThat(result.getTotalUsers()).isEqualTo(200L);
    }

    @Test
    @DisplayName("✅ getLatestSnapshot() — retourne null si aucun snapshot")
    void testGetLatestSnapshot_NotFound() {
        // ARRANGE
        when(snapshotRepository.findTopByOrderBySnapshotTimeDesc()).thenReturn(Optional.empty());

        // ACT
        MetricsSnapshot result = dashboardService.getLatestSnapshot();

        // ASSERT
        assertThat(result).isNull();
    }

    // ─────────────────────────────────────────────────────────
    //  Tests filterStats()
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ filterStats() — filtre par plage de dates")
    void testFilterStats_ByDateRange() {
        // ARRANGE
        LocalDateTime now = LocalDateTime.now();
        StatsFilterRequestDTO filter = StatsFilterRequestDTO.builder()
                .startDate(now.minusDays(7))
                .endDate(now)
                .build();

        List<MetricsSnapshot> mockResult = List.of(
                MetricsSnapshot.builder().id(1L).totalUsers(100L).totalRevenue(1000.0)
                        .snapshotTime(now.minusDays(3)).build(),
                MetricsSnapshot.builder().id(2L).totalUsers(200L).totalRevenue(2000.0)
                        .snapshotTime(now.minusDays(1)).build()
        );
        when(snapshotRepository.findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc(any(), any()))
                .thenReturn(mockResult);

        // ACT
        List<MetricsSnapshot> result = dashboardService.filterStats(filter);

        // ASSERT
        assertThat(result).hasSize(2);
        assertThat(result).extracting(MetricsSnapshot::getTotalUsers)
                          .containsExactlyInAnyOrder(100L, 200L);
    }

    @Test
    @DisplayName("✅ filterStats() — filtre par revenue minimum")
    void testFilterStats_ByMinRevenue() {
        // ARRANGE
        LocalDateTime now = LocalDateTime.now();
        StatsFilterRequestDTO filter = StatsFilterRequestDTO.builder()
                .startDate(now.minusDays(30))
                .endDate(now)
                .minRevenue(1500.0)   // Seulement les snapshots avec revenue >= 1500
                .build();

        List<MetricsSnapshot> mockResult = List.of(
                MetricsSnapshot.builder().id(1L).totalRevenue(500.0)
                        .snapshotTime(now.minusDays(3)).build(),   // En dessous du seuil
                MetricsSnapshot.builder().id(2L).totalRevenue(2000.0)
                        .snapshotTime(now.minusDays(2)).build(),   // Au-dessus
                MetricsSnapshot.builder().id(3L).totalRevenue(3000.0)
                        .snapshotTime(now.minusDays(1)).build()    // Au-dessus
        );
        when(snapshotRepository.findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc(any(), any()))
                .thenReturn(mockResult);

        // ACT
        List<MetricsSnapshot> result = dashboardService.filterStats(filter);

        // ASSERT — Seulement 2 snapshots avec revenue >= 1500
        assertThat(result).hasSize(2);
        assertThat(result).extracting(MetricsSnapshot::getTotalRevenue)
                          .containsExactlyInAnyOrder(2000.0, 3000.0);
    }

    // ─────────────────────────────────────────────────────────
    //  Tests getSnapshotsByRange()
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ getSnapshotsByRange() — retourne les snapshots dans la plage")
    void testGetSnapshotsByRange() {
        // ARRANGE
        LocalDateTime now = LocalDateTime.now();
        SnapshotRangeRequestDTO request = SnapshotRangeRequestDTO.builder()
                .from(now.minusDays(5)).to(now).build();

        List<MetricsSnapshot> mockResult = List.of(
                MetricsSnapshot.builder().id(1L).snapshotTime(now.minusDays(3)).build(),
                MetricsSnapshot.builder().id(2L).snapshotTime(now.minusDays(1)).build()
        );
        when(snapshotRepository.findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc(any(), any()))
                .thenReturn(mockResult);

        // ACT
        List<MetricsSnapshot> result = dashboardService.getSnapshotsByRange(request);

        // ASSERT
        assertThat(result).hasSize(2);
    }

    // ─────────────────────────────────────────────────────────
    //  Tests createAuditLog()
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ createAuditLog() — crée et sauvegarde un audit log")
    void testCreateAuditLog() {
        // ARRANGE
        AuditLogRequestDTO request = AuditLogRequestDTO.builder()
                .adminId("admin@smartride.com")
                .action("SNAPSHOT_TAKEN")
                .details("Test audit")
                .module("DASHBOARD")
                .build();

        AuditLog savedLog = AuditLog.builder()
                .id(1L)
                .adminId("admin@smartride.com")
                .action("SNAPSHOT_TAKEN")
                .details("Test audit")
                .module("DASHBOARD")
                .timestamp(LocalDateTime.now())
                .build();
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(savedLog);

        // ACT
        AuditLog result = dashboardService.createAuditLog(request);

        // ASSERT
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getAdminId()).isEqualTo("admin@smartride.com");
        assertThat(result.getAction()).isEqualTo("SNAPSHOT_TAKEN");
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("✅ createAuditLog() — module null → 'DASHBOARD' par défaut")
    void testCreateAuditLog_DefaultModule() {
        // ARRANGE — module non fourni
        AuditLogRequestDTO request = AuditLogRequestDTO.builder()
                .adminId("admin@test.com")
                .action("CONFIG_CHANGED")
                .module(null)   // pas de module
                .build();

        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        // ACT
        AuditLog result = dashboardService.createAuditLog(request);

        // ASSERT — module par défaut = DASHBOARD
        assertThat(result.getModule()).isEqualTo("DASHBOARD");
    }

    // ─────────────────────────────────────────────────────────
    //  Tests deleteSnapshotsBefore()
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ deleteSnapshotsBefore() — retourne le nombre de supprimés")
    void testDeleteSnapshotsBefore() {
        // ARRANGE
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        when(snapshotRepository.deleteBySnapshotTimeBefore(cutoff)).thenReturn(5);

        // ACT
        int deleted = dashboardService.deleteSnapshotsBefore(cutoff);

        // ASSERT
        assertThat(deleted).isEqualTo(5);
        verify(snapshotRepository, times(1)).deleteBySnapshotTimeBefore(cutoff);
    }
}
