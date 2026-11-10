package com.smartride.dashboard.repository;

import com.smartride.dashboard.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    List<AuditLog> findByAdminId(String adminId);

    List<AuditLog> findByModule(String module);

    List<AuditLog> findByTimestampBetween(LocalDateTime from, LocalDateTime to);

    List<AuditLog> findByAction(String action);
}
