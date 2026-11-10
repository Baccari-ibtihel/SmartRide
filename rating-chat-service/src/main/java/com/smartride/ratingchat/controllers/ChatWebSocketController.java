package com.smartride.ratingchat.controllers;


import java.security.Principal;


import com.smartride.ratingchat.dto.WsPayloads;
import com.smartride.ratingchat.exceptions.BusinessException;
import com.smartride.ratingchat.exceptions.ForbiddenException;
import com.smartride.ratingchat.exceptions.ResourceNotFoundException;
import com.smartride.ratingchat.services.ChatService;
import com.smartride.ratingchat.websocket.ChatDestinations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

/**
 * Point d'entree STOMP du chat (prefixe /app).
 * L'identite de l'expediteur vient de la session WebSocket (Principal), jamais du message.
 */
@Controller
public class ChatWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    /** Le message est enregistre puis diffuse par ChatEventListener. */
    @MessageMapping("chat.send")
    public void send(@Payload WsPayloads.SendMessage payload, Principal principal) {
        chatService.sendMessage(requireConversationId(payload.conversationId()), userId(principal), payload.content());
    }

    @MessageMapping("chat.typing")
    public void typing(@Payload WsPayloads.Typing payload, Principal principal) {
        Long conversationId = requireConversationId(payload.conversationId());
        Long userId = userId(principal);
        chatService.requireParticipant(conversationId, userId);
        messagingTemplate.convertAndSend(ChatDestinations.typing(conversationId),
                new WsPayloads.TypingEvent(conversationId, userId, payload.typing()));
    }

    @MessageMapping("chat.read")
    public void read(@Payload WsPayloads.Read payload, Principal principal) {
        chatService.markAsRead(requireConversationId(payload.conversationId()), userId(principal));
    }

    /** Toute erreur est renvoyee uniquement a l'expediteur, sur /user/queue/errors. */
    @MessageExceptionHandler
    @SendToUser(destinations = ChatDestinations.USER_ERRORS, broadcast = false)
    public WsPayloads.Error handleError(Exception ex) {
        if (ex instanceof BusinessException || ex instanceof ForbiddenException
                || ex instanceof ResourceNotFoundException) {
            return new WsPayloads.Error(ex.getMessage());
        }
        log.error("Erreur WebSocket inattendue", ex);
        return new WsPayloads.Error("Erreur interne, message non envoye");
    }

    private static Long requireConversationId(Long conversationId) {
        if (conversationId == null) {
            throw new BusinessException("conversationId est obligatoire");
        }
        return conversationId;
    }

    private static Long userId(Principal principal) {
        return Long.valueOf(principal.getName());
    }
}
