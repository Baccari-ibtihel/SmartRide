package com.smartride.ratingchat.events;


import com.smartride.ratingchat.dto.ChatMessageResponse;

/** Publie par ChatService ; diffuse en WebSocket une fois la transaction validee. */
public record MessageSentEvent(ChatMessageResponse message, Long recipientId) {
}
