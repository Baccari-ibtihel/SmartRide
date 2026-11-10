package com.smartride.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request body for filtered statistics — allows filtering snapshots by date range.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Filtre de recherche pour les statistiques par période")
public class StatsFilterRequestDTO {

    @Schema(description = "Date de début de la période", example = "2026-10-01T00:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @Schema(description = "Date de fin de la période", example = "2026-10-31T23:59:59")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    @Schema(description = "Inclure uniquement les snapshots avec revenue > minRevenue", example = "0.0")
    private Double minRevenue;

    @Schema(description = "Nombre minimum d'utilisateurs", example = "0")
    private Long minUsers;
}
