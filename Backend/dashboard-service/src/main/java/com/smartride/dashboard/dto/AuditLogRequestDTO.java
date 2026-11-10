package com.smartride.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for creating an admin audit log entry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Données pour créer une entrée dans le journal d'audit administrateur")
public class AuditLogRequestDTO {

    @Schema(description = "Nom ou identifiant de l'administrateur", example = "admin@smartride.com",
            requiredMode = io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED)
    private String adminId;

    @Schema(description = "Action effectuée par l'administrateur", example = "SNAPSHOT_TAKEN",
            requiredMode = io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED)
    private String action;

    @Schema(description = "Détails supplémentaires ou commentaire", example = "Snapshot manuel déclenché après maintenance")
    private String details;

    @Schema(description = "Module concerné par l'action", example = "DASHBOARD")
    private String module;
}
