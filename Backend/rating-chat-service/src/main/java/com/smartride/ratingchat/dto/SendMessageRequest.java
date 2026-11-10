package com.smartride.ratingchat.dto;


import com.smartride.ratingchat.entities.ChatMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotBlank(message = "Le message ne peut pas etre vide")
        @Size(max = ChatMessage.MAX_LENGTH, message = "Le message ne doit pas depasser 2000 caracteres") String content) {
}
