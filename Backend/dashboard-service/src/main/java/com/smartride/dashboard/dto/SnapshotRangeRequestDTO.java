package com.smartride.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request body for retrieving snapshots within a date range.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Plage de dates pour la recherche de snapshots")
public class SnapshotRangeRequestDTO {

    @Schema(description = "Date de début (incluse)", example = "2026-10-01T00:00:00",
            requiredMode = io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime from;

    @Schema(description = "Date de fin (incluse)", example = "2026-10-31T23:59:59")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime to;
}
