package com.smartride.ratingchat.controllers;


import java.net.URI;
import java.util.List;


import com.smartride.ratingchat.dto.ChatMessageResponse;
import com.smartride.ratingchat.dto.ConversationResponse;
import com.smartride.ratingchat.dto.OpenConversationRequest;
import com.smartride.ratingchat.dto.PageResponse;
import com.smartride.ratingchat.dto.ReadReceipt;
import com.smartride.ratingchat.dto.SendMessageRequest;
import com.smartride.ratingchat.dto.UnreadCountResponse;
import com.smartride.ratingchat.services.ChatService;
import com.smartride.ratingchat.utils.UserHeaders;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST du chat. Les messages envoyes ici sont AUSSI diffuses en temps reel sur le WebSocket.
 */
@RestController
@RequestMapping("/api/chat")
@Tag(name = "Chat", description = "Messagerie conducteur <-> passager")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/conversations")
    @Operation(summary = "Ouvrir (ou recuperer) la conversation d'un trajet entre un passager et le conducteur")
    public ConversationResponse open(@RequestHeader(UserHeaders.USER_ID) Long userId,
            @Valid @RequestBody OpenConversationRequest request) {
        return chatService.openConversation(userId, request);
    }

    @GetMapping("/conversations")
    @Operation(summary = "Mes conversations (la plus recente en premier) avec le nombre de non-lus")
    public List<ConversationResponse> myConversations(@RequestHeader(UserHeaders.USER_ID) Long userId) {
        return chatService.getConversations(userId);
    }

    @GetMapping("/conversations/{id}")
    @Operation(summary = "Detail d'une conversation")
    public ConversationResponse getConversation(@PathVariable Long id,
            @RequestHeader(UserHeaders.USER_ID) Long userId) {
        return chatService.getConversation(id, userId);
    }

    @GetMapping("/conversations/{id}/messages")
    @Operation(summary = "Historique des messages, du plus recent au plus ancien (?page=0&size=20)")
    public PageResponse<ChatMessageResponse> messages(@PathVariable Long id,
            @RequestHeader(UserHeaders.USER_ID) Long userId,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return chatService.getMessages(id, userId, pageable);
    }

    @PostMapping("/conversations/{id}/messages")
    @Operation(summary = "Envoyer un message (alternative REST au WebSocket)")
    public ResponseEntity<ChatMessageResponse> send(@PathVariable Long id,
            @RequestHeader(UserHeaders.USER_ID) Long userId,
            @Valid @RequestBody SendMessageRequest request) {
        ChatMessageResponse message = chatService.sendMessage(id, userId, request.content());
        return ResponseEntity.created(URI.create("/api/chat/conversations/" + id + "/messages/" + message.id()))
                .body(message);
    }

    @PatchMapping("/conversations/{id}/read")
    @Operation(summary = "Marquer comme lus les messages recus dans la conversation")
    public ReadReceipt markAsRead(@PathVariable Long id, @RequestHeader(UserHeaders.USER_ID) Long userId) {
        return chatService.markAsRead(id, userId);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Nombre total de messages non lus (badge)")
    public UnreadCountResponse unreadCount(@RequestHeader(UserHeaders.USER_ID) Long userId) {
        return chatService.getUnreadCount(userId);
    }
}
