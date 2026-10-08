package com.smartride.dashboard.service;

import com.smartride.dashboard.dto.*;

public interface DashboardService {

    DashboardSummaryDTO getDashboardSummary(int days);

    UserStatsDTO getUserStats(int days);

    TripStatsDTO getTripStats(int days);

    BookingStatsDTO getBookingStats(int days);

    PaymentStatsDTO getPaymentStats(int days);

    ReportExportDTO generateReport(String reportType, String format, int days, String adminId);
}
