package com.smartride.dashboard.repository;

import com.smartride.dashboard.model.MetricsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricsSnapshotRepository extends JpaRepository<MetricsSnapshot, Long> {

    Optional<MetricsSnapshot> findTopByOrderBySnapshotTimeDesc();

    List<MetricsSnapshot> findAllBySnapshotTimeAfter(LocalDateTime from);

    List<MetricsSnapshot> findAllBySnapshotTimeBetween(LocalDateTime from, LocalDateTime to);

    List<MetricsSnapshot> findAllBySnapshotTimeBetweenOrderBySnapshotTimeDesc(LocalDateTime from, LocalDateTime to);

    @Modifying
    @Transactional
    @Query("DELETE FROM MetricsSnapshot s WHERE s.snapshotTime < :before")
    int deleteBySnapshotTimeBefore(@Param("before") LocalDateTime before);

    @Query("SELECT COUNT(s) FROM MetricsSnapshot s WHERE s.snapshotTime >= :from")
    long countSnapshotsAfter(@Param("from") LocalDateTime from);
}
