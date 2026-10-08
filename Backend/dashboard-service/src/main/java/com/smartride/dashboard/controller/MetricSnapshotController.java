package com.smartride.dashboard.controller;

import com.smartride.dashboard.entity.DailyMetricSnapshot;
import com.smartride.dashboard.repository.DailyMetricSnapshotRepository;
import com.smartride.dashboard.service.MetricAggregatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard/snapshots")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Dashboard Snapshots", description = "Gestion des instantanés de métriques quotidiennes")
public class MetricSnapshotController {

    private final MetricAggregatorService metricAggregatorService;
    private final DailyMetricSnapshotRepository snapshotRepository;

    @PostMapping("/refresh")
    @Operation(summary = "Forcer l'agrégation des métriques du jour", description = "Calcule et sauvegarde l'instantané des statistiques de la journée dans MySQL.")
    public ResponseEntity<DailyMetricSnapshot> refreshTodaySnapshot() {
        DailyMetricSnapshot snapshot = metricAggregatorService.generateOrUpdateDailySnapshot(LocalDate.now());
        return ResponseEntity.ok(snapshot);
    }

    @GetMapping("/history")
    @Operation(summary = "Consulter l'historique des métriques", description = "Récupère les métriques journalières enregistrées en base sur les N derniers jours.")
    public ResponseEntity<List<DailyMetricSnapshot>> getSnapshotHistory(
            @RequestParam(defaultValue = "30") int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        return ResponseEntity.ok(snapshotRepository.findByMetricDateBetweenOrderByMetricDateAsc(startDate, endDate));
    }
}
