package com.smartride.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportExportDTO {
    private String reportId;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format; // "CSV", "JSON"
    private String content;
    private String generatedBy;
}
