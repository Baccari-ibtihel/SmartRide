package com.smartride.dashboard.service;

import com.smartride.dashboard.entity.DailyMetricSnapshot;

import java.time.LocalDate;

public interface MetricAggregatorService {

    DailyMetricSnapshot generateOrUpdateDailySnapshot(LocalDate date);

    void aggregateAndSaveHistoricalMetrics();
}
