package com.smartride.ratingchat.dto;


import java.time.LocalDateTime;


import com.smartride.ratingchat.entities.Conversation;

/**
 * Vue d'une conversation pour un utilisateur donne.
 *
 * @param otherParticipantId la personne avec qui on discute
 * @param unreadCount        messages non lus par l'utilisateur qui consulte
 */
public record ConversationResponse(
        Long id,
        Long tripId,
        Long passengerId,
        Long driverId,
        Long otherParticipantId,
        String lastMessagePreview,
        LocalDateTime lastMessageAt,
        long unreadCount,
        LocalDateTime createdAt) {

    public static ConversationResponse from(Conversation conversation, Long viewerId, long unreadCount) {
        return new ConversationResponse(conversation.getId(), conversation.getTripId(),
                conversation.getPassengerId(), conversation.getDriverId(), conversation.otherParticipant(viewerId),
                conversation.getLastMessagePreview(), conversation.getLastMessageAt(), unreadCount,
                conversation.getCreatedAt());
    }
}
