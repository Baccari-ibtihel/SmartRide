package com.smartride.dashboard.repository;

import com.smartride.dashboard.entity.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {

    List<AdminAuditLog> findTop20ByOrderByTimestampDesc();

    List<AdminAuditLog> findByAdminIdOrderByTimestampDesc(String adminId);
}
