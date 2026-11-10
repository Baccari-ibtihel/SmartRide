package com.smartride.ratingchat.events;


import com.smartride.ratingchat.dto.ChatMessageResponse;
import com.smartride.ratingchat.dto.ReadReceipt;
import com.smartride.ratingchat.websocket.ChatDestinations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Diffuse les evenements du chat aux clients connectes, APRES le commit en base
 * (un message annule par un rollback n'est jamais diffuse).
 */
@Component
public class ChatEventListener {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatEventListener(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @TransactionalEventListener
    public void onMessageSent(MessageSentEvent event) {
        ChatMessageResponse message = event.message();
        messagingTemplate.convertAndSend(ChatDestinations.conversation(message.conversationId()), message);
        messagingTemplate.convertAndSendToUser(event.recipientId().toString(), ChatDestinations.USER_MESSAGES, message);
    }

    @TransactionalEventListener
    public void onMessagesRead(ReadReceipt receipt) {
        messagingTemplate.convertAndSend(ChatDestinations.readReceipts(receipt.conversationId()), receipt);
    }
}
