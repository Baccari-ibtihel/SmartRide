package com.smartride.ratingchat.websocket;


import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


import com.smartride.ratingchat.services.ChatService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

/**
 * Securite minimale du WebSocket :
 * - CONNECT : le client doit envoyer l'en-tete STOMP "userId" (plus tard : le JWT) ;
 * - SUBSCRIBE : on ne peut ecouter que ses propres conversations et sa file /user/queue/**.
 * En cas de refus, le client recoit une trame STOMP ERROR (avec la raison) et la connexion est fermee.
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    public static final String USER_ID_HEADER = "userId";

    private static final Pattern CONVERSATION_TOPIC = Pattern.compile("^/topic/conversations/(\\d+)(/typing|/read)?$");

    private final ObjectProvider<ChatService> chatService;
    private final ObjectProvider<MessageChannel> clientOutboundChannel;

    public StompAuthChannelInterceptor(ObjectProvider<ChatService> chatService,
            @Qualifier("clientOutboundChannel") ObjectProvider<MessageChannel> clientOutboundChannel) {
        this.chatService = chatService;
        this.clientOutboundChannel = clientOutboundChannel;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }
        if (accessor.getCommand() == StompCommand.CONNECT) {
            String userId = parseUserId(accessor.getFirstNativeHeader(USER_ID_HEADER));
            if (userId == null) {
                return reject(accessor, "En-tete STOMP '" + USER_ID_HEADER + "' manquant ou invalide");
            }
            accessor.setUser(new StompPrincipal(userId));
        } else if (accessor.getCommand() == StompCommand.SUBSCRIBE
                && !canSubscribe(accessor.getUser(), accessor.getDestination())) {
            return reject(accessor, "Abonnement refuse a " + accessor.getDestination());
        }
        // SEND, DISCONNECT... : les droits sont controles dans ChatService
        return message;
    }

    private boolean canSubscribe(Principal user, String destination) {
        if (user == null || destination == null) {
            return false;
        }
        if (destination.startsWith("/user/queue/")) {
            return true;
        }
        Matcher matcher = CONVERSATION_TOPIC.matcher(destination);
        return matcher.matches()
                && chatService.getObject().isParticipant(Long.valueOf(matcher.group(1)), Long.valueOf(user.getName()));
    }

    /** Envoie une trame ERROR au client et ignore son message (return null). */
    private Message<?> reject(StompHeaderAccessor accessor, String reason) {
        StompHeaderAccessor error = StompHeaderAccessor.create(StompCommand.ERROR);
        error.setMessage(reason);
        error.setSessionId(accessor.getSessionId());
        clientOutboundChannel.getObject().send(MessageBuilder.createMessage(new byte[0], error.getMessageHeaders()));
        return null;
    }

    private static String parseUserId(String raw) {
        try {
            long userId = Long.parseLong(raw == null ? "" : raw.trim());
            return userId > 0 ? String.valueOf(userId) : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
