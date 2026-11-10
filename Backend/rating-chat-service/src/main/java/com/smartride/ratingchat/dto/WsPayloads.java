package com.smartride.ratingchat.dto;

/** Messages JSON echanges sur le WebSocket. */
public final class WsPayloads {

    private WsPayloads() {
    }

    /** Envoye par le client sur /app/chat.send */
    public record SendMessage(Long conversationId, String content) {
    }

    /** Envoye par le client sur /app/chat.typing */
    public record Typing(Long conversationId, boolean typing) {
    }

    /** Envoye par le client sur /app/chat.read */
    public record Read(Long conversationId) {
    }

    /** Diffuse sur /topic/conversations/{id}/typing */
    public record TypingEvent(Long conversationId, Long userId, boolean typing) {
    }

    /** Renvoye a l'expediteur sur /user/queue/errors */
    public record Error(String message) {
    }
}
