package com.smartride.ratingchat.websocket;

/**
 * Canaux STOMP du chat.
 *
 * <pre>
 * Le client ENVOIE vers :           /app/chat.send   /app/chat.typing   /app/chat.read
 * Le client S'ABONNE a :            /topic/conversations/{id}          (nouveaux messages)
 *                                   /topic/conversations/{id}/typing   ("est en train d'ecrire")
 *                                   /topic/conversations/{id}/read     (accuses de lecture)
 *                                   /user/queue/messages               (tous mes messages recus : badge, liste)
 *                                   /user/queue/errors                 (erreurs de mes envois)
 * </pre>
 */
public final class ChatDestinations {

    public static final String USER_MESSAGES = "/queue/messages";
    public static final String USER_ERRORS = "/queue/errors";

    private ChatDestinations() {
    }

    public static String conversation(Long conversationId) {
        return "/topic/conversations/" + conversationId;
    }

    public static String typing(Long conversationId) {
        return conversation(conversationId) + "/typing";
    }

    public static String readReceipts(Long conversationId) {
        return conversation(conversationId) + "/read";
    }
}
