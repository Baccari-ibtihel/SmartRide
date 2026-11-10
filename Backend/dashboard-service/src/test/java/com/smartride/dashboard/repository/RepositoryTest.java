package com.smartride.dashboard.repository;

import com.smartride.dashboard.model.AuditLog;
import com.smartride.dashboard.model.MetricsSnapshot;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ✅ Tests Repository — connectés à H2 (base en mémoire).
 *
 * @DataJpaTest charge uniquement la couche JPA (pas tout le contexte Spring).
 * H2 remplace MySQL automatiquement grâce au profil "test".
 */
@DataJpaTest
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.yml")
@DisplayName("🗄️ Tests Repository — MetricsSnapshot & AuditLog")
class RepositoryTest {

    @Autowired
    private MetricsSnapshotRepository snapshotRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    // ─────────────────────────────────────────────────────────
    //  Setup : vider la base avant chaque test
    // ─────────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        snapshotRepository.deleteAll();
        auditLogRepository.deleteAll();
    }

    // ─────────────────────────────────────────────────────────
    //  Tests MetricsSnapshot
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ Sauvegarder un snapshot et le retrouver en base")
    void testSaveAndFindSnapshot() {
        // ARRANGE — Préparer un snapshot
        MetricsSnapshot snapshot = MetricsSnapshot.builder()
                .snapshotTime(LocalDateTime.now())
                .totalUsers(150L)
                .totalTrips(80L)
                .totalBookings(200L)
                .totalRevenue(4500.0)
                .build();

        // ACT — Sauvegarder en base H2
        MetricsSnapshot saved = snapshotRepository.save(snapshot);

        // ASSERT — Vérifier que l'ID est généré et les données sont correctes
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTotalUsers()).isEqualTo(150L);
        assertThat(saved.getTotalTrips()).isEqualTo(80L);
        assertThat(saved.getTotalBookings()).isEqualTo(200L);
        assertThat(saved.getTotalRevenue()).isEqualTo(4500.0);
    }

    @Test
    @DisplayName("✅ findTopByOrderBySnapshotTimeDesc — retourne le plus récent")
    void testFindLatestSnapshot() {
        // ARRANGE — Créer 3 snapshots à des moments différents
        MetricsSnapshot old = MetricsSnapshot.builder()
                .snapshotTime(LocalDateTime.now().minusDays(3))
                .totalUsers(50L).totalRevenue(1000.0).build();

        MetricsSnapshot middle = MetricsSnapshot.builder()
                .snapshotTime(LocalDateTime.now().minusDays(1))
                .totalUsers(100L).totalRevenue(2000.0).build();

        MetricsSnapshot latest = MetricsSnapshot.builder()
                .snapshotTime(LocalDateTime.now())
                .totalUsers(200L).totalRevenue(5000.0).build();

        snapshotRepository.saveAll(List.of(old, middle, latest));

        // ACT — Récupérer le dernier
        Optional<MetricsSnapshot> result = snapshotRepository.findTopByOrderBySnapshotTimeDesc();

        // ASSERT — Doit être le plus récent (200 users, 5000 revenue)
        assertThat(result).isPresent();
        assertThat(result.get().getTotalUsers()).isEqualTo(200L);
        assertThat(result.get().getTotalRevenue()).isEqualTo(5000.0);
    }

    @Test
    @DisplayName("✅ findTopByOrderBySnapshotTimeDesc — retourne vide si rien en base")
    void testFindLatestSnapshot_Empty() {
        // ACT
        Optional<MetricsSnapshot> result = snapshotRepository.findTopByOrderBySnapshotTimeDesc();

        // ASSERT — Base vide → Optional vide
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("✅ findAllBySnapshotTimeBetween — filtre par plage de dates")
    void testFindSnapshotsByRange() {
        // ARRANGE
        LocalDateTime now = LocalDateTime.now();

        MetricsSnapshot s1 = MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(10)).totalUsers(10L).build();
        MetricsSnapshot s2 = MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(5)).totalUsers(20L).build();
        MetricsSnapshot s3 = MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(1)).totalUsers(30L).build();

        snapshotRepository.saveAll(List.of(s1, s2, s3));

        // ACT — Récupérer seulement entre -7 jours et maintenant
        List<MetricsSnapshot> result = snapshotRepository
                .findAllBySnapshotTimeBetween(now.minusDays(7), now);

        // ASSERT — Doit contenir s2 et s3, pas s1 (trop vieux)
        assertThat(result).hasSize(2);
        assertThat(result).extracting(MetricsSnapshot::getTotalUsers)
                          .containsExactlyInAnyOrder(20L, 30L);
    }

    @Test
    @DisplayName("✅ deleteBySnapshotTimeBefore — supprime les anciens snapshots")
    void testDeleteSnapshotsBefore() {
        // ARRANGE
        LocalDateTime now = LocalDateTime.now();

        snapshotRepository.save(MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(10)).totalUsers(10L).build());
        snapshotRepository.save(MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(5)).totalUsers(20L).build());
        snapshotRepository.save(MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(1)).totalUsers(30L).build());

        // ACT — Supprimer les snapshots de plus de 3 jours
        int deleted = snapshotRepository.deleteBySnapshotTimeBefore(now.minusDays(3));

        // ASSERT — 2 supprimés (10 jours et 5 jours), 1 reste (1 jour)
        assertThat(deleted).isEqualTo(2);
        assertThat(snapshotRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("✅ findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc — tri décroissant")
    void testFindSnapshotsByRangeOrdered() {
        // ARRANGE
        LocalDateTime now = LocalDateTime.now();

        MetricsSnapshot s1 = MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(2)).totalUsers(10L).build();
        MetricsSnapshot s2 = MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(1)).totalUsers(20L).build();

        snapshotRepository.saveAll(List.of(s1, s2));

        // ACT
        List<MetricsSnapshot> result = snapshotRepository
                .findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc(now.minusDays(5), now);

        // ASSERT — Le plus récent en premier (20 users avant 10 users)
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTotalUsers()).isEqualTo(20L);
        assertThat(result.get(1).getTotalUsers()).isEqualTo(10L);
    }

    // ─────────────────────────────────────────────────────────
    //  Tests AuditLog
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ Sauvegarder un AuditLog et le retrouver en base")
    void testSaveAuditLog() {
        // ARRANGE
        AuditLog log = AuditLog.builder()
                .adminId("admin@smartride.com")
                .action("SNAPSHOT_TAKEN")
                .details("Test de sauvegarde audit")
                .module("DASHBOARD")
                .timestamp(LocalDateTime.now())
                .build();

        // ACT
        AuditLog saved = auditLogRepository.save(log);

        // ASSERT
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getAdminId()).isEqualTo("admin@smartride.com");
        assertThat(saved.getAction()).isEqualTo("SNAPSHOT_TAKEN");
        assertThat(saved.getModule()).isEqualTo("DASHBOARD");
    }

    @Test
    @DisplayName("✅ findByAdminId — retrouver les logs d'un admin")
    void testFindAuditLogByAdminId() {
        // ARRANGE
        auditLogRepository.save(AuditLog.builder()
                .adminId("admin1@test.com").action("LOGIN").module("AUTH")
                .timestamp(LocalDateTime.now()).build());
        auditLogRepository.save(AuditLog.builder()
                .adminId("admin1@test.com").action("SNAPSHOT_TAKEN").module("DASHBOARD")
                .timestamp(LocalDateTime.now()).build());
        auditLogRepository.save(AuditLog.builder()
                .adminId("admin2@test.com").action("REPORT_EXPORTED").module("REPORTS")
                .timestamp(LocalDateTime.now()).build());

        // ACT
        List<AuditLog> result = auditLogRepository.findByAdminId("admin1@test.com");

        // ASSERT — admin1 a 2 logs, admin2 en a 1
        assertThat(result).hasSize(2);
        assertThat(result).extracting(AuditLog::getAdminId)
                          .containsOnly("admin1@test.com");
    }

    @Test
    @DisplayName("✅ findByModule — retrouver les logs d'un module")
    void testFindAuditLogByModule() {
        // ARRANGE
        auditLogRepository.save(AuditLog.builder()
                .adminId("admin@test.com").action("A1").module("DASHBOARD")
                .timestamp(LocalDateTime.now()).build());
        auditLogRepository.save(AuditLog.builder()
                .adminId("admin@test.com").action("A2").module("DASHBOARD")
                .timestamp(LocalDateTime.now()).build());
        auditLogRepository.save(AuditLog.builder()
                .adminId("admin@test.com").action("A3").module("PAYMENTS")
                .timestamp(LocalDateTime.now()).build());

        // ACT
        List<AuditLog> dashboardLogs = auditLogRepository.findByModule("DASHBOARD");

        // ASSERT
        assertThat(dashboardLogs).hasSize(2);
    }

    @Test
    @DisplayName("✅ countSnapshotsAfter — compte les snapshots récents")
    void testCountSnapshotsAfter() {
        // ARRANGE
        LocalDateTime now = LocalDateTime.now();
        snapshotRepository.save(MetricsSnapshot.builder()
                .snapshotTime(now.minusHours(1)).totalUsers(10L).build());
        snapshotRepository.save(MetricsSnapshot.builder()
                .snapshotTime(now.minusHours(2)).totalUsers(20L).build());
        snapshotRepository.save(MetricsSnapshot.builder()
                .snapshotTime(now.minusDays(5)).totalUsers(5L).build());

        // ACT — Compter les snapshots des dernières 3 heures
        long count = snapshotRepository.countSnapshotsAfter(now.minusHours(3));

        // ASSERT — 2 snapshots dans les 3 dernières heures
        assertThat(count).isEqualTo(2);
    }
}
