package com.smartride.dashboard.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEventDTO implements Serializable {
    private String adminId;
    private String action;
    private String module;
    private String details;
    private LocalDateTime timestamp;
}
