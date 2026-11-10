package com.smartride.ratingchat.repositories;


import java.util.List;
import java.util.Optional;


import com.smartride.ratingchat.entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByTripIdAndPassengerIdAndDriverId(Long tripId, Long passengerId, Long driverId);

    /**
     * SELECT ... FOR UPDATE : verrouille la conversation pendant l'envoi d'un message.
     * Sans ce verrou, deux messages simultanes dans la meme conversation provoquent un deadlock MySQL
     * (insertion du message + mise a jour de lastMessage).
     * Requete native car Hibernate genererait "FOR UPDATE OF ..." (MySQL 8), refuse par MariaDB/XAMPP.
     */
    @Query(value = "select * from conversations where id = :id for update", nativeQuery = true)
    Optional<Conversation> findByIdForUpdate(@Param("id") Long id);

    /** Conversations d'un utilisateur, la plus recente en premier. */
    @Query("""
            select c from Conversation c
            where c.passengerId = :userId or c.driverId = :userId
            order by coalesce(c.lastMessageAt, c.createdAt) desc, c.id desc
            """)
    List<Conversation> findAllForUser(@Param("userId") Long userId);
}
