package com.smartride.ratingchat.dto;


import java.time.LocalDateTime;

/** "readerId a lu updatedCount message(s) de la conversation" (accuse de lecture). */
public record ReadReceipt(Long conversationId, Long readerId, int updatedCount, LocalDateTime readAt) {
}
