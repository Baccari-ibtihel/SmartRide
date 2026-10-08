package com.smartride.dashboard.init;

import com.smartride.dashboard.entity.AdminAuditLog;
import com.smartride.dashboard.entity.DailyMetricSnapshot;
import com.smartride.dashboard.repository.AdminAuditLogRepository;
import com.smartride.dashboard.repository.DailyMetricSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DailyMetricSnapshotRepository snapshotRepository;
    private final AdminAuditLogRepository auditLogRepository;

    @Override
    public void run(String... args) throws Exception {
        if (snapshotRepository.count() == 0) {
            log.info("Populating initial 30-day historical dashboard analytics snapshots in MySQL database...");

            Random random = new Random(42); // Fixed seed for reproducible sample metrics
            LocalDate startDate = LocalDate.now().minusDays(30);

            long baseUsers = 1200;
            long baseTrips = 2800;
            long baseBookings = 4500;
            double baseRevenue = 85000.0;

            for (int i = 0; i <= 30; i++) {
                LocalDate date = startDate.plusDays(i);

                baseUsers += 10 + random.nextInt(20);
                baseTrips += 25 + random.nextInt(35);
                baseBookings += 40 + random.nextInt(60);

                double dailyRevenue = 2000.0 + random.nextDouble() * 1500.0;
                baseRevenue += dailyRevenue;
                double commission = dailyRevenue * 0.15;

                DailyMetricSnapshot snapshot = DailyMetricSnapshot.builder()
                        .metricDate(date)
                        .totalUsers(baseUsers)
                        .activeUsers(Math.round(baseUsers * 0.75))
                        .newUsersToday(10 + random.nextInt(20))
                        .totalTripsPublished(baseTrips)
                        .completedTrips(Math.round(baseTrips * 0.90))
                        .cancelledTrips(Math.round(baseTrips * 0.07))
                        .totalBookings(baseBookings)
                        .confirmedBookings(Math.round(baseBookings * 0.92))
                        .totalRevenue(Math.round(baseRevenue * 100.0) / 100.0)
                        .platformCommission(Math.round(commission * 100.0) / 100.0)
                        .build();

                snapshotRepository.save(snapshot);
            }

            auditLogRepository.save(AdminAuditLog.builder()
                    .adminId("SYSTEM_INIT")
                    .action("INITIALISATION_DONNÉES")
                    .resource("DASHBOARD_SERVICE")
                    .details("Initialisation réussie des instantanés statistiques MySQL (30 jours).")
                    .timestamp(LocalDateTime.now())
                    .build());

            log.info("Successfully populated 30 days of historical dashboard metrics in MySQL.");
        } else {
            log.info("Dashboard MySQL database already initialized with {} metric snapshots.", snapshotRepository.count());
        }
    }
}
