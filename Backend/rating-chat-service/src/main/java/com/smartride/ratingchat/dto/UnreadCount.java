package com.smartride.ratingchat.dto;

/** Nombre de messages non lus dans une conversation. */
public record UnreadCount(Long conversationId, Long total) {
}
