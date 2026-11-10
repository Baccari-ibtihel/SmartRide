package com.smartride.ratingchat.dto;

/** Badge "messages non lus" de l'utilisateur, toutes conversations confondues. */
public record UnreadCountResponse(Long userId, long unreadCount) {
}
