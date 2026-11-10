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
public class UserEventDTO implements Serializable {
    private String eventType; // USER_REGISTERED, USER_UPDATED, USER_DELETED, USER_SUSPENDED
    private Long userId;
    private String email;
    private String fullName;
    private String role; // CONDUCTEUR, PASSAGER, ADMIN
    private LocalDateTime timestamp;
}
