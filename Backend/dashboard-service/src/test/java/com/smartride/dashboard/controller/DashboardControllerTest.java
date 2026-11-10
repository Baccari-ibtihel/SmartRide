package com.smartride.dashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smartride.dashboard.dto.AuditLogRequestDTO;
import com.smartride.dashboard.dto.DashboardStatsDTO;
import com.smartride.dashboard.dto.SnapshotRangeRequestDTO;
import com.smartride.dashboard.dto.StatsFilterRequestDTO;
import com.smartride.dashboard.model.AuditLog;
import com.smartride.dashboard.model.MetricsSnapshot;
import com.smartride.dashboard.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.smartride.dashboard.config.CorsConfig;
import com.smartride.dashboard.config.OpenApiConfig;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ✅ Tests Controller — utilise MockMvc pour simuler les requêtes HTTP.
 * @WebMvcTest charge uniquement la couche HTTP (contrôleur), pas la BDD.
 * On exclut CorsConfig et OpenApiConfig pour éviter des problèmes de beans Feign/Eureka.
 */
@WebMvcTest(
    controllers = DashboardController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {CorsConfig.class, OpenApiConfig.class}
    )
)
@ActiveProfiles("test")
@DisplayName("🌐 Tests Controller — DashboardController")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;  // Simule les appels HTTP sans démarrer un vrai serveur

    @MockBean
    private DashboardService dashboardService;  // Service simulé

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // Pour sérialiser LocalDateTime
    }

    // ─────────────────────────────────────────────────────────
    //  Tests GET endpoints
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ GET /api/dashboard/health — retourne 200 et le message")
    void testHealth() throws Exception {
        // ACT + ASSERT — Appel HTTP GET et vérification réponse
        mockMvc.perform(get("/api/dashboard/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Dashboard Service is up and running!"));
    }

    @Test
    @DisplayName("✅ GET /api/dashboard/stats — retourne 200 avec les stats")
    void testGetStats() throws Exception {
        // ARRANGE — Simuler la réponse du service
        DashboardStatsDTO mockStats = DashboardStatsDTO.builder()
                .totalUsers(150L)
                .totalTrips(80L)
                .totalBookings(200L)
                .totalRevenue(4500.0)
                .userServiceStatus("UP")
                .tripServiceStatus("UP")
                .bookingServiceStatus("DOWN")
                .paymentServiceStatus("UP")
                .notificationTrackingServiceStatus("UP")
                .build();
        when(dashboardService.getStats()).thenReturn(mockStats);

        // ACT + ASSERT
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalUsers").value(150))
                .andExpect(jsonPath("$.totalTrips").value(80))
                .andExpect(jsonPath("$.totalBookings").value(200))
                .andExpect(jsonPath("$.totalRevenue").value(4500.0))
                .andExpect(jsonPath("$.userServiceStatus").value("UP"))
                .andExpect(jsonPath("$.bookingServiceStatus").value("DOWN"));
    }

    @Test
    @DisplayName("✅ GET /api/dashboard/snapshot/latest — retourne 200 si snapshot existe")
    void testGetLatestSnapshot_Found() throws Exception {
        // ARRANGE
        MetricsSnapshot snap = MetricsSnapshot.builder()
                .id(1L)
                .snapshotTime(LocalDateTime.of(2026, 10, 23, 9, 0, 0))
                .totalUsers(100L)
                .totalRevenue(2000.0)
                .build();
        when(dashboardService.getLatestSnapshot()).thenReturn(snap);

        // ACT + ASSERT
        mockMvc.perform(get("/api/dashboard/snapshot/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.totalUsers").value(100))
                .andExpect(jsonPath("$.totalRevenue").value(2000.0));
    }

    @Test
    @DisplayName("✅ GET /api/dashboard/snapshot/latest — retourne 204 si aucun snapshot")
    void testGetLatestSnapshot_NotFound() throws Exception {
        // ARRANGE — Aucun snapshot en base
        when(dashboardService.getLatestSnapshot()).thenReturn(null);

        // ACT + ASSERT — HTTP 204 No Content
        mockMvc.perform(get("/api/dashboard/snapshot/latest"))
                .andExpect(status().isNoContent());
    }

    // ─────────────────────────────────────────────────────────
    //  Tests POST endpoints
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ POST /api/dashboard/snapshot — crée et retourne 200")
    void testTakeSnapshot() throws Exception {
        // ARRANGE
        MetricsSnapshot snap = MetricsSnapshot.builder()
                .id(1L)
                .snapshotTime(LocalDateTime.of(2026, 10, 23, 9, 0, 0))
                .totalUsers(150L)
                .totalTrips(80L)
                .totalRevenue(4500.0)
                .build();
        when(dashboardService.takeSnapshot()).thenReturn(snap);

        // ACT + ASSERT — POST sans body
        mockMvc.perform(post("/api/dashboard/snapshot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.totalUsers").value(150))
                .andExpect(jsonPath("$.totalRevenue").value(4500.0));
    }

    @Test
    @DisplayName("✅ POST /api/dashboard/stats/filter — filtre et retourne la liste")
    void testFilterStats() throws Exception {
        // ARRANGE
        StatsFilterRequestDTO filter = StatsFilterRequestDTO.builder()
                .startDate(LocalDateTime.of(2026, 10, 1, 0, 0, 0))
                .endDate(LocalDateTime.of(2026, 10, 31, 23, 59, 59))
                .minRevenue(1000.0)
                .build();

        List<MetricsSnapshot> mockResult = List.of(
                MetricsSnapshot.builder().id(1L).totalUsers(100L).totalRevenue(2000.0)
                        .snapshotTime(LocalDateTime.of(2026, 10, 10, 0, 0)).build(),
                MetricsSnapshot.builder().id(2L).totalUsers(200L).totalRevenue(3000.0)
                        .snapshotTime(LocalDateTime.of(2026, 10, 20, 0, 0)).build()
        );
        when(dashboardService.filterStats(any(StatsFilterRequestDTO.class))).thenReturn(mockResult);

        // ACT + ASSERT
        mockMvc.perform(post("/api/dashboard/stats/filter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(filter)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].totalUsers").value(100))
                .andExpect(jsonPath("$[1].totalUsers").value(200));
    }

    @Test
    @DisplayName("✅ POST /api/dashboard/snapshot/range — retourne la liste des snapshots")
    void testGetSnapshotsByRange() throws Exception {
        // ARRANGE
        SnapshotRangeRequestDTO request = SnapshotRangeRequestDTO.builder()
                .from(LocalDateTime.of(2026, 10, 1, 0, 0, 0))
                .to(LocalDateTime.of(2026, 10, 31, 23, 59, 59))
                .build();

        List<MetricsSnapshot> mockResult = List.of(
                MetricsSnapshot.builder().id(1L).snapshotTime(LocalDateTime.of(2026, 10, 15, 0, 0)).build(),
                MetricsSnapshot.builder().id(2L).snapshotTime(LocalDateTime.of(2026, 10, 20, 0, 0)).build()
        );
        when(dashboardService.getSnapshotsByRange(any(SnapshotRangeRequestDTO.class))).thenReturn(mockResult);

        // ACT + ASSERT
        mockMvc.perform(post("/api/dashboard/snapshot/range")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("✅ POST /api/dashboard/audit-log — crée et retourne 201")
    void testCreateAuditLog() throws Exception {
        // ARRANGE
        AuditLogRequestDTO request = AuditLogRequestDTO.builder()
                .adminId("admin@smartride.com")
                .action("SNAPSHOT_TAKEN")
                .details("Test via MockMvc")
                .module("DASHBOARD")
                .build();

        AuditLog saved = AuditLog.builder()
                .id(1L)
                .adminId("admin@smartride.com")
                .action("SNAPSHOT_TAKEN")
                .module("DASHBOARD")
                .timestamp(LocalDateTime.of(2026, 10, 23, 9, 0, 0))
                .build();
        when(dashboardService.createAuditLog(any(AuditLogRequestDTO.class))).thenReturn(saved);

        // ACT + ASSERT
        mockMvc.perform(post("/api/dashboard/audit-log")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())   // HTTP 201
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.adminId").value("admin@smartride.com"))
                .andExpect(jsonPath("$.action").value("SNAPSHOT_TAKEN"));
    }

    @Test
    @DisplayName("✅ POST /api/dashboard/audit-log — retourne 400 si adminId manquant")
    void testCreateAuditLog_BadRequest_MissingAdminId() throws Exception {
        // ARRANGE — adminId vide
        AuditLogRequestDTO request = AuditLogRequestDTO.builder()
                .adminId("")       // Vide → doit retourner 400
                .action("SNAPSHOT_TAKEN")
                .build();

        // ACT + ASSERT — HTTP 400 Bad Request
        mockMvc.perform(post("/api/dashboard/audit-log")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("✅ POST /api/dashboard/audit-log — retourne 400 si action manquante")
    void testCreateAuditLog_BadRequest_MissingAction() throws Exception {
        // ARRANGE — action vide
        AuditLogRequestDTO request = AuditLogRequestDTO.builder()
                .adminId("admin@smartride.com")
                .action("")        // Vide → doit retourner 400
                .build();

        // ACT + ASSERT
        mockMvc.perform(post("/api/dashboard/audit-log")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("✅ POST /api/dashboard/snapshot/cleanup — supprime et retourne le compte")
    void testDeleteSnapshotsBefore() throws Exception {
        // ARRANGE
        when(dashboardService.deleteSnapshotsBefore(any(LocalDateTime.class))).thenReturn(7);

        // ACT + ASSERT
        mockMvc.perform(post("/api/dashboard/snapshot/cleanup")
                        .param("before", "2026-09-01T00:00:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted").value(7))
                .andExpect(jsonPath("$.message").value("7 snapshot(s) supprimé(s)"));
    }
}
