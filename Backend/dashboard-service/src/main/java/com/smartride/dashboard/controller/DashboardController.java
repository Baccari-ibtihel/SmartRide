package com.smartride.dashboard.controller;

import com.smartride.dashboard.dto.AuditLogRequestDTO;
import com.smartride.dashboard.dto.DashboardStatsDTO;
import com.smartride.dashboard.dto.SnapshotRangeRequestDTO;
import com.smartride.dashboard.dto.StatsFilterRequestDTO;
import com.smartride.dashboard.model.AuditLog;
import com.smartride.dashboard.model.MetricsSnapshot;
import com.smartride.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(
    name = "📊 Dashboard",
    description = "Endpoints du tableau de bord administrateur : statistiques live, snapshots, audit log et gestion des données"
)
public class DashboardController {

    private final DashboardService dashboardService;

    // ─────────────────────────────────────────────────────────
    //  GET — HEALTH
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "🟢 Health Check",
        description = "Vérifie que le **Dashboard Service** est opérationnel et accessible."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Service en ligne",
        content = @Content(
            mediaType = MediaType.TEXT_PLAIN_VALUE,
            examples = @ExampleObject(value = "Dashboard Service is up and running!")
        )
    )
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Dashboard Service is up and running!");
    }

    // ─────────────────────────────────────────────────────────
    //  GET — STATS LIVE
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "📈 Statistiques live",
        description = """
            Collecte et agrège en **temps réel** les données de tous les microservices connectés :
            - 👥 **User Service** → nombre total d'utilisateurs
            - 🚗 **Trip Service** → trajets actifs / terminés
            - 📅 **Booking Service** → réservations par statut
            - 💳 **Payment Service** → revenus générés
            - 📍 **Notification/Tracking** → suivi des événements
            
            > ⚠️ Si un service est indisponible, la réponse est dégradée gracieusement (fallback).
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Statistiques agrégées retournées avec succès",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = DashboardStatsDTO.class)
            )
        ),
        @ApiResponse(responseCode = "503", description = "Un ou plusieurs microservices indisponibles")
    })
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    // ─────────────────────────────────────────────────────────
    //  GET — SNAPSHOT : DERNIER
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "🕒 Dernier snapshot",
        description = "Retourne le **dernier snapshot de métriques** persisté en base de données."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Snapshot trouvé et retourné",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = MetricsSnapshot.class)
            )
        ),
        @ApiResponse(responseCode = "204", description = "Aucun snapshot disponible en base de données")
    })
    @GetMapping("/snapshot/latest")
    public ResponseEntity<MetricsSnapshot> getLatestSnapshot() {
        MetricsSnapshot snapshot = dashboardService.getLatestSnapshot();
        if (snapshot == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(snapshot);
    }

    // ─────────────────────────────────────────────────────────
    //  POST 1 — SNAPSHOT : CRÉER
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "💾 Créer un snapshot",
        description = """
            Prend une **photo instantanée** des métriques actuelles et la persiste dans **MySQL**.
            
            Utile pour :
            - Générer un rapport périodique
            - Conserver l'historique d'évolution de la plateforme
            - Comparer les performances dans le temps
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Snapshot créé et sauvegardé en base MySQL",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = MetricsSnapshot.class)
            )
        )
    })
    @PostMapping("/snapshot")
    public ResponseEntity<MetricsSnapshot> takeSnapshot() {
        return ResponseEntity.ok(dashboardService.takeSnapshot());
    }

    // ─────────────────────────────────────────────────────────
    //  POST 2 — STATS : FILTRÉES PAR PÉRIODE ET SEUILS
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "🔍 Statistiques filtrées",
        description = """
            Recherche dans les **snapshots historiques** (MySQL) selon des critères :
            - 📅 **startDate / endDate** : Plage de dates
            - 💰 **minRevenue** : Seuil minimum de revenus
            - 👥 **minUsers** : Seuil minimum d'utilisateurs
            
            Tous les critères sont **optionnels**. Si aucun filtre n'est fourni, tous les snapshots sont retournés.
            Les résultats sont triés du **plus récent au plus ancien**.
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Liste des snapshots correspondant aux critères",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = MetricsSnapshot.class)
            )
        )
    })
    @PostMapping("/stats/filter")
    public ResponseEntity<List<MetricsSnapshot>> filterStats(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Critères de filtrage. Tous les champs sont optionnels.",
                required = true,
                content = @Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = @Schema(implementation = StatsFilterRequestDTO.class),
                    examples = @ExampleObject(
                        name = "Exemple filtre",
                        summary = "Filtre par période et seuils",
                        value = """
                            {
                              "startDate": "2026-10-01T00:00:00",
                              "endDate": "2026-10-31T23:59:59",
                              "minRevenue": 1000.0,
                              "minUsers": 50
                            }
                            """
                    )
                )
            )
            @RequestBody StatsFilterRequestDTO filter) {
        return ResponseEntity.ok(dashboardService.filterStats(filter));
    }

    // ─────────────────────────────────────────────────────────
    //  POST 3 — SNAPSHOTS : PLAGE DE DATES
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "📅 Snapshots par plage de dates",
        description = """
            Retourne tous les **snapshots de métriques** compris entre `from` et `to`.
            - Résultats triés du **plus récent au plus ancien**
            - Si `from` est omis → depuis le début des données
            - Si `to` est omis → jusqu'à maintenant
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Liste des snapshots dans la plage demandée",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = MetricsSnapshot.class)
            )
        )
    })
    @PostMapping("/snapshot/range")
    public ResponseEntity<List<MetricsSnapshot>> getSnapshotsByRange(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Plage de dates pour la recherche de snapshots",
                required = true,
                content = @Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = @Schema(implementation = SnapshotRangeRequestDTO.class),
                    examples = @ExampleObject(
                        name = "Exemple plage",
                        summary = "Plage de dates octobre 2026",
                        value = """
                            {
                              "from": "2026-10-01T00:00:00",
                              "to": "2026-10-23T23:59:59"
                            }
                            """
                    )
                )
            )
            @RequestBody SnapshotRangeRequestDTO request) {
        return ResponseEntity.ok(dashboardService.getSnapshotsByRange(request));
    }

    // ─────────────────────────────────────────────────────────
    //  POST 4 — AUDIT LOG : CRÉER UNE ENTRÉE
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "📝 Créer une entrée d'audit",
        description = """
            Enregistre une action administrative dans le **journal d'audit** persisté en MySQL.
            
            Exemples d'actions à auditer :
            - `SNAPSHOT_TAKEN` : snapshot manuel déclenché
            - `CONFIG_CHANGED` : modification de configuration
            - `ALERT_DISMISSED` : alerte acquittée par l'admin
            - `REPORT_EXPORTED` : rapport exporté
            - `USER_BLOCKED` : utilisateur bloqué par l'admin
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Entrée d'audit créée avec succès",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = AuditLog.class)
            )
        ),
        @ApiResponse(responseCode = "400", description = "adminId ou action manquants")
    })
    @PostMapping("/audit-log")
    public ResponseEntity<AuditLog> createAuditLog(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Données de l'entrée d'audit à créer",
                required = true,
                content = @Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = @Schema(implementation = AuditLogRequestDTO.class),
                    examples = @ExampleObject(
                        name = "Exemple audit",
                        summary = "Audit d'un snapshot manuel",
                        value = """
                            {
                              "adminId": "admin@smartride.com",
                              "action": "SNAPSHOT_TAKEN",
                              "details": "Snapshot manuel après maintenance planifiée",
                              "module": "DASHBOARD"
                            }
                            """
                    )
                )
            )
            @RequestBody AuditLogRequestDTO request) {
        if (request.getAdminId() == null || request.getAdminId().isBlank()
                || request.getAction() == null || request.getAction().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        AuditLog created = dashboardService.createAuditLog(request);
        return ResponseEntity.status(201).body(created);
    }

    // ─────────────────────────────────────────────────────────
    //  POST 5 — SNAPSHOT : SUPPRIMER ANCIENS
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "🗑️ Supprimer les anciens snapshots",
        description = """
            Supprime tous les snapshots **antérieurs** à la date fournie.
            
            ⚠️ **Action irréversible** — À utiliser pour maintenir la taille de la base de données.
            Retourne le **nombre d'entrées supprimées**.
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Suppression effectuée — retourne le nombre de lignes supprimées",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(value = "{\"deleted\": 42}")
            )
        ),
        @ApiResponse(responseCode = "400", description = "Paramètre 'before' manquant ou invalide")
    })
    @PostMapping("/snapshot/cleanup")
    public ResponseEntity<Map<String, Object>> deleteSnapshotsBefore(
            @Parameter(
                description = "Supprimer tous les snapshots antérieurs à cette date (format: yyyy-MM-dd'T'HH:mm:ss)",
                example = "2026-09-01T00:00:00"
            )
            @RequestParam("before")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime before) {
        int deleted = dashboardService.deleteSnapshotsBefore(before);
        return ResponseEntity.ok(Map.of(
                "deleted", deleted,
                "before", before.toString(),
                "message", deleted + " snapshot(s) supprimé(s)"
        ));
    }

    // ─────────────────────────────────────────────────────────
    //  GET — SNAPSHOTS : TOUS
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "📋 Tous les snapshots",
        description = """
            Retourne **l'historique complet** de tous les snapshots de métriques sauvegardés en base MySQL.
            - Résultats triés du **plus récent au plus ancien**
            - Utiliser `POST /snapshot/range` pour filtrer par période
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "Liste complète des snapshots",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(implementation = MetricsSnapshot.class)
        )
    )
    @GetMapping("/snapshots")
    public ResponseEntity<List<MetricsSnapshot>> getAllSnapshots() {
        return ResponseEntity.ok(dashboardService.getAllSnapshots());
    }

    // ─────────────────────────────────────────────────────────
    //  GET — AUDIT LOG : TOUS
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "📋 Tous les logs d'audit",
        description = """
            Retourne **l'historique complet** du journal d'audit administrateur.
            - Toutes les actions enregistrées par tous les admins
            - Résultats triés du **plus récent au plus ancien**
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "Liste complète des entrées d'audit",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(implementation = AuditLog.class)
        )
    )
    @GetMapping("/audit-log")
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(dashboardService.getAllAuditLogs());
    }

    // ─────────────────────────────────────────────────────────
    //  GET — AUDIT LOG : PAR ADMIN
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "🔎 Audit logs d'un administrateur",
        description = """
            Retourne toutes les actions enregistrées pour un **administrateur spécifique**.
            
            Exemple : `admin@smartride.com` → voir tout ce que cet admin a fait.
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Liste des actions de cet admin",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = AuditLog.class)
            )
        ),
        @ApiResponse(responseCode = "200", description = "Liste vide si aucun log trouvé pour cet admin")
    })
    @GetMapping("/audit-log/admin/{adminId}")
    public ResponseEntity<List<AuditLog>> getAuditLogsByAdmin(
            @Parameter(
                description = "Identifiant de l'administrateur",
                example = "admin@smartride.com"
            )
            @PathVariable String adminId) {
        return ResponseEntity.ok(dashboardService.getAuditLogsByAdmin(adminId));
    }

    // ─────────────────────────────────────────────────────────
    //  GET — AUDIT LOG : PAR MODULE
    // ─────────────────────────────────────────────────────────

    @Operation(
        summary = "🗂️ Audit logs d'un module",
        description = """
            Retourne toutes les actions enregistrées pour un **module spécifique**.
            
            Modules disponibles : `DASHBOARD`, `PAYMENTS`, `AUTH`, `REPORTS`, `USERS`
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "Liste des actions sur ce module",
        content = @Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = @Schema(implementation = AuditLog.class)
        )
    )
    @GetMapping("/audit-log/module/{module}")
    public ResponseEntity<List<AuditLog>> getAuditLogsByModule(
            @Parameter(
                description = "Nom du module",
                example = "DASHBOARD"
            )
            @PathVariable String module) {
        return ResponseEntity.ok(dashboardService.getAuditLogsByModule(module));
    }
}
