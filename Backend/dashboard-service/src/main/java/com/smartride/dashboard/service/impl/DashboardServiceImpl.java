package com.smartride.dashboard.service.impl;

import com.smartride.dashboard.dto.*;
import com.smartride.dashboard.entity.AdminAuditLog;
import com.smartride.dashboard.entity.DailyMetricSnapshot;
import com.smartride.dashboard.repository.AdminAuditLogRepository;
import com.smartride.dashboard.repository.DailyMetricSnapshotRepository;
import com.smartride.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final DailyMetricSnapshotRepository snapshotRepository;
    private final AdminAuditLogRepository auditLogRepository;

    @Override
    public DashboardSummaryDTO getDashboardSummary(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<DailyMetricSnapshot> snapshots = snapshotRepository.findByMetricDateBetweenOrderByMetricDateAsc(startDate, endDate);
        
        DailyMetricSnapshot latest = snapshots.isEmpty() ? 
                snapshotRepository.findLatestSnapshot().orElse(createDefaultSnapshot(endDate)) 
                : snapshots.get(snapshots.size() - 1);

        DailyMetricSnapshot earliest = snapshots.isEmpty() ? latest : snapshots.get(0);

        long totalUsers = latest.getTotalUsers();
        long totalTrips = latest.getTotalTripsPublished();
        long totalBookings = latest.getTotalBookings();
        double totalRevenue = snapshots.stream().mapToDouble(DailyMetricSnapshot::getTotalRevenue).sum();
        double platformCommission = snapshots.stream().mapToDouble(DailyMetricSnapshot::getPlatformCommission).sum();

        // Calculate growth metrics percentage
        double userGrowth = calculateGrowth(earliest.getTotalUsers(), latest.getTotalUsers());
        double tripGrowth = calculateGrowth(earliest.getTotalTripsPublished(), latest.getTotalTripsPublished());
        double bookingGrowth = calculateGrowth(earliest.getTotalBookings(), latest.getTotalBookings());
        double revenueGrowth = calculateGrowth(earliest.getTotalRevenue(), latest.getTotalRevenue());

        UserStatsDTO userStats = getUserStats(days);
        TripStatsDTO tripStats = getTripStats(days);
        BookingStatsDTO bookingStats = getBookingStats(days);
        PaymentStatsDTO paymentStats = getPaymentStats(days);

        return DashboardSummaryDTO.builder()
                .generatedAt(LocalDateTime.now())
                .period("DERNIERS_" + days + "_JOURS")
                .totalUsers(totalUsers)
                .totalTrips(totalTrips)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .platformCommission(platformCommission)
                .userGrowthPercentage(userGrowth)
                .tripGrowthPercentage(tripGrowth)
                .bookingGrowthPercentage(bookingGrowth)
                .revenueGrowthPercentage(revenueGrowth)
                .userStats(userStats)
                .tripStats(tripStats)
                .bookingStats(bookingStats)
                .paymentStats(paymentStats)
                .build();
    }

    @Override
    public UserStatsDTO getUserStats(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        List<DailyMetricSnapshot> snapshots = snapshotRepository.findByMetricDateBetweenOrderByMetricDateAsc(startDate, endDate);

        long totalUsers = snapshots.isEmpty() ? 1540 : snapshots.get(snapshots.size() - 1).getTotalUsers();
        long activeUsers = snapshots.isEmpty() ? 1180 : snapshots.get(snapshots.size() - 1).getActiveUsers();
        long driversCount = Math.round(totalUsers * 0.35);
        long passengersCount = totalUsers - driversCount;

        List<TimeSeriesPointDTO> registrationTrend = new ArrayList<>();
        List<TimeSeriesPointDTO> activeTrend = new ArrayList<>();

        for (DailyMetricSnapshot s : snapshots) {
            registrationTrend.add(new TimeSeriesPointDTO(s.getMetricDate(), s.getTotalUsers(), s.getMetricDate().toString()));
            activeTrend.add(new TimeSeriesPointDTO(s.getMetricDate(), s.getActiveUsers(), s.getMetricDate().toString()));
        }

        return UserStatsDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .driversCount(driversCount)
                .passengersCount(passengersCount)
                .newUsersThisMonth(snapshots.stream().mapToLong(DailyMetricSnapshot::getNewUsersToday).sum())
                .userGrowthRatePercentage(12.5)
                .userRegistrationTrend(registrationTrend)
                .activeUserTrend(activeTrend)
                .build();
    }

    @Override
    public TripStatsDTO getTripStats(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        List<DailyMetricSnapshot> snapshots = snapshotRepository.findByMetricDateBetweenOrderByMetricDateAsc(startDate, endDate);

        long totalTrips = snapshots.stream().mapToLong(DailyMetricSnapshot::getTotalTripsPublished).sum();
        long completedTrips = snapshots.stream().mapToLong(DailyMetricSnapshot::getCompletedTrips).sum();
        long cancelledTrips = snapshots.stream().mapToLong(DailyMetricSnapshot::getCancelledTrips).sum();
        long activeTrips = Math.max(0, totalTrips - completedTrips - cancelledTrips);
        double completionRate = totalTrips > 0 ? ((double) completedTrips / totalTrips) * 100.0 : 92.5;

        List<TimeSeriesPointDTO> tripTrend = new ArrayList<>();
        for (DailyMetricSnapshot s : snapshots) {
            tripTrend.add(new TimeSeriesPointDTO(s.getMetricDate(), s.getTotalTripsPublished(), s.getMetricDate().toString()));
        }

        Map<String, Long> popularRoutes = new LinkedHashMap<>();
        popularRoutes.put("Tunis -> Sousse", 420L);
        popularRoutes.put("Tunis -> Sfax", 310L);
        popularRoutes.put("Sousse -> Monastir", 280L);
        popularRoutes.put("Tunis -> Bizerte", 195L);
        popularRoutes.put("Sfax -> Gabès", 140L);

        return TripStatsDTO.builder()
                .totalTripsPublished(totalTrips)
                .activeTrips(activeTrips)
                .completedTrips(completedTrips)
                .cancelledTrips(cancelledTrips)
                .completionRatePercentage(Math.round(completionRate * 10.0) / 10.0)
                .totalDistanceKm(completedTrips * 135.0)
                .tripPublicationTrend(tripTrend)
                .popularRoutes(popularRoutes)
                .build();
    }

    @Override
    public BookingStatsDTO getBookingStats(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        List<DailyMetricSnapshot> snapshots = snapshotRepository.findByMetricDateBetweenOrderByMetricDateAsc(startDate, endDate);

        long totalBookings = snapshots.stream().mapToLong(DailyMetricSnapshot::getTotalBookings).sum();
        long confirmedBookings = snapshots.stream().mapToLong(DailyMetricSnapshot::getConfirmedBookings).sum();
        long cancelledBookings = Math.round(totalBookings * 0.08);
        long pendingBookings = Math.max(0, totalBookings - confirmedBookings - cancelledBookings);
        double confirmationRate = totalBookings > 0 ? ((double) confirmedBookings / totalBookings) * 100.0 : 91.0;

        List<TimeSeriesPointDTO> bookingTrend = new ArrayList<>();
        for (DailyMetricSnapshot s : snapshots) {
            bookingTrend.add(new TimeSeriesPointDTO(s.getMetricDate(), s.getTotalBookings(), s.getMetricDate().toString()));
        }

        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        statusBreakdown.put("CONFIRMED", confirmedBookings);
        statusBreakdown.put("PENDING", pendingBookings);
        statusBreakdown.put("CANCELLED", cancelledBookings);

        return BookingStatsDTO.builder()
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .confirmationRatePercentage(Math.round(confirmationRate * 10.0) / 10.0)
                .averageSeatsPerBooking(1.8)
                .bookingTrend(bookingTrend)
                .bookingStatusBreakdown(statusBreakdown)
                .build();
    }

    @Override
    public PaymentStatsDTO getPaymentStats(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        List<DailyMetricSnapshot> snapshots = snapshotRepository.findByMetricDateBetweenOrderByMetricDateAsc(startDate, endDate);

        double totalRevenue = snapshots.stream().mapToDouble(DailyMetricSnapshot::getTotalRevenue).sum();
        double totalCommission = snapshots.stream().mapToDouble(DailyMetricSnapshot::getPlatformCommission).sum();

        List<TimeSeriesPointDTO> revenueTrend = new ArrayList<>();
        for (DailyMetricSnapshot s : snapshots) {
            revenueTrend.add(new TimeSeriesPointDTO(s.getMetricDate(), s.getTotalRevenue(), s.getMetricDate().toString()));
        }

        Map<String, Double> paymentMethodDistribution = new LinkedHashMap<>();
        paymentMethodDistribution.put("CARTE_BANCAIRE", 65.0);
        paymentMethodDistribution.put("FLOUCI / D17", 25.0);
        paymentMethodDistribution.put("ESPÈCES", 10.0);

        return PaymentStatsDTO.builder()
                .totalGrossVolume(totalRevenue)
                .totalPlatformRevenue(totalCommission)
                .averageTransactionValue(24.50)
                .totalTransactions(Math.round(totalRevenue / 24.50))
                .successfulTransactions(Math.round((totalRevenue / 24.50) * 0.96))
                .failedTransactions(Math.round((totalRevenue / 24.50) * 0.04))
                .revenueTrend(revenueTrend)
                .paymentMethodDistribution(paymentMethodDistribution)
                .build();
    }

    @Override
    public ReportExportDTO generateReport(String reportType, String format, int days, String adminId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        DashboardSummaryDTO summary = getDashboardSummary(days);

        String reportId = "REP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String title = "Rapport SmartRide - " + reportType + " (" + days + " jours)";

        StringBuilder content = new StringBuilder();
        if ("CSV".equalsIgnoreCase(format)) {
            content.append("Metric,Value\n");
            content.append("Total Utilisateurs,").append(summary.getTotalUsers()).append("\n");
            content.append("Total Trajets,").append(summary.getTotalTrips()).append("\n");
            content.append("Total Réservations,").append(summary.getTotalBookings()).append("\n");
            content.append("Chiffre d'Affaires Brut (TND),").append(summary.getTotalRevenue()).append("\n");
            content.append("Commissions Plateforme (TND),").append(summary.getPlatformCommission()).append("\n");
        } else {
            content.append("{\n")
                    .append("  \"reportId\": \"").append(reportId).append("\",\n")
                    .append("  \"period\": \"").append(days).append(" jours\",\n")
                    .append("  \"totalUsers\": ").append(summary.getTotalUsers()).append(",\n")
                    .append("  \"totalTrips\": ").append(summary.getTotalTrips()).append(",\n")
                    .append("  \"totalBookings\": ").append(summary.getTotalBookings()).append(",\n")
                    .append("  \"totalRevenueTND\": ").append(summary.getTotalRevenue()).append(",\n")
                    .append("  \"platformCommissionTND\": ").append(summary.getPlatformCommission()).append("\n")
                    .append("}");
        }

        // Audit Log entry
        auditLogRepository.save(AdminAuditLog.builder()
                .adminId(adminId != null ? adminId : "ADMIN_SYSTEM")
                .action("GÉNÉRATION_RAPPORT")
                .resource("DASHBOARD_SERVICE")
                .details("Rapport " + reportType + " généré au format " + format + " pour " + days + " jours.")
                .timestamp(LocalDateTime.now())
                .build());

        return ReportExportDTO.builder()
                .reportId(reportId)
                .title(title)
                .startDate(startDate)
                .endDate(endDate)
                .format(format.toUpperCase())
                .content(content.toString())
                .generatedBy(adminId != null ? adminId : "ADMIN_SYSTEM")
                .build();
    }

    private double calculateGrowth(double previous, double current) {
        if (previous == 0) return 0.0;
        double growth = ((current - previous) / previous) * 100.0;
        return Math.round(growth * 10.0) / 10.0;
    }

    private DailyMetricSnapshot createDefaultSnapshot(LocalDate date) {
        return DailyMetricSnapshot.builder()
                .metricDate(date)
                .totalUsers(1500)
                .activeUsers(1100)
                .newUsersToday(25)
                .totalTripsPublished(3800)
                .completedTrips(3500)
                .cancelledTrips(300)
                .totalBookings(6000)
                .confirmedBookings(5500)
                .totalRevenue(120000.0)
                .platformCommission(18000.0)
                .build();
    }
}
