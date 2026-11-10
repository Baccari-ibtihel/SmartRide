package com.smartride.ratingchat.repositories;


import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;


import com.smartride.ratingchat.dto.UnreadCount;
import com.smartride.ratingchat.entities.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByConversationId(Long conversationId, Pageable pageable);

    /** Marque comme lus tous les messages recus (envoyes par l'autre participant). */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update ChatMessage m set m.readAt = :readAt
            where m.conversation.id = :conversationId and m.senderId <> :readerId and m.readAt is null
            """)
    int markAsRead(@Param("conversationId") Long conversationId, @Param("readerId") Long readerId,
            @Param("readAt") LocalDateTime readAt);

    @Query("""
            select new com.smartride.ratingchat.dto.UnreadCount(m.conversation.id, count(m))
            from ChatMessage m
            where m.conversation.id in :conversationIds and m.senderId <> :userId and m.readAt is null
            group by m.conversation.id
            """)
    List<UnreadCount> countUnreadByConversation(@Param("conversationIds") Collection<Long> conversationIds,
            @Param("userId") Long userId);

    @Query("""
            select count(m) from ChatMessage m
            where (m.conversation.passengerId = :userId or m.conversation.driverId = :userId)
              and m.senderId <> :userId and m.readAt is null
            """)
    long countUnreadForUser(@Param("userId") Long userId);
}
