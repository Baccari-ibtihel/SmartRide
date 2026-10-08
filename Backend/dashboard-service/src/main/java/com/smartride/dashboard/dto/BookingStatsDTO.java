package com.smartride.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingStatsDTO {
    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private double confirmationRatePercentage;
    private double averageSeatsPerBooking;
    private List<TimeSeriesPointDTO> bookingTrend;
    private Map<String, Long> bookingStatusBreakdown;
}
