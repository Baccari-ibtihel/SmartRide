package com.smartride.dashboard.controller;

import com.smartride.dashboard.dto.*;
import com.smartride.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Dashboard Service", description = "Statistiques et Tableau de Bord Administrateur SmartRide")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Obtenir le résumé global du tableau de bord (KPIs & Indicateurs)", description = "Fournit une vue synthétique administrateur réunissant utilisateurs, trajets, réservations et paiements.")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(days));
    }

    @GetMapping("/users/stats")
    @Operation(summary = "Obtenir les statistiques détaillées des utilisateurs", description = "Consulter le nombre total, conducteurs, passagers et l'évolution temporelle des utilisateurs.")
    public ResponseEntity<UserStatsDTO> getUserStats(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getUserStats(days));
    }

    @GetMapping("/trips/stats")
    @Operation(summary = "Analyse complète des trajets", description = "Analyser les trajets publiés, complétés, annulés et les itinéraires les plus populaires.")
    public ResponseEntity<TripStatsDTO> getTripStats(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getTripStats(days));
    }

    @GetMapping("/bookings/stats")
    @Operation(summary = "Suivi détaillé des réservations", description = "Analyser les réservations effectuées, leur évolution et le taux de confirmation.")
    public ResponseEntity<BookingStatsDTO> getBookingStats(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getBookingStats(days));
    }

    @GetMapping("/payments/stats")
    @Operation(summary = "Analyse financière et des paiements", description = "Suivre les transactions, le chiffre d'affaires et la commission générée pour la plateforme.")
    public ResponseEntity<PaymentStatsDTO> getPaymentStats(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getPaymentStats(days));
    }

    @GetMapping("/reports/export")
    @Operation(summary = "Générer et exporter des rapports d'activité", description = "Générer un rapport statistique au format CSV ou JSON.")
    public ResponseEntity<ReportExportDTO> exportReport(
            @RequestParam(defaultValue = "GLOBAL") String type,
            @RequestParam(defaultValue = "CSV") String format,
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false, defaultValue = "ADMIN_DASHBOARD") String adminId) {
        return ResponseEntity.ok(dashboardService.generateReport(type, format, days, adminId));
    }
}
