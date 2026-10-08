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
public class PaymentStatsDTO {
    private double totalGrossVolume;
    private double totalPlatformRevenue;
    private double averageTransactionValue;
    private long totalTransactions;
    private long successfulTransactions;
    private long failedTransactions;
    private List<TimeSeriesPointDTO> revenueTrend;
    private Map<String, Double> paymentMethodDistribution;
}
