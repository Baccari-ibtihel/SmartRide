package com.smartride.ratingchat.dto;


import java.time.LocalDateTime;


import com.smartride.ratingchat.entities.ChatMessage;

public record ChatMessageResponse(
        Long id,
        Long conversationId,
        Long senderId,
        String content,
        LocalDateTime sentAt,
        LocalDateTime readAt) {

    public static ChatMessageResponse from(ChatMessage message) {
        return new ChatMessageResponse(message.getId(), message.getConversation().getId(), message.getSenderId(),
                message.getContent(), message.getSentAt(), message.getReadAt());
    }
}
