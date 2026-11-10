package com.smartride.ratingchat.services;


import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


import java.util.Optional;


import com.smartride.ratingchat.dto.ChatMessageResponse;
import com.smartride.ratingchat.dto.OpenConversationRequest;
import com.smartride.ratingchat.dto.ReadReceipt;
import com.smartride.ratingchat.entities.Conversation;
import com.smartride.ratingchat.events.MessageSentEvent;
import com.smartride.ratingchat.exceptions.BusinessException;
import com.smartride.ratingchat.exceptions.ForbiddenException;
import com.smartride.ratingchat.repositories.ChatMessageRepository;
import com.smartride.ratingchat.repositories.ConversationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    private static final Long PASSENGER = 1L;
    private static final Long DRIVER = 2L;
    private static final Long OUTSIDER = 3L;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ChatMessageRepository messageRepository;

    @Mock
    private ApplicationEventPublisher events;

    @InjectMocks
    private ChatService chatService;

    @Test
    void openConversation_rejectsUserWhoIsNeitherPassengerNorDriver() {
        OpenConversationRequest request = new OpenConversationRequest(100L, PASSENGER, DRIVER);

        assertThatThrownBy(() -> chatService.openConversation(OUTSIDER, request))
                .isInstanceOf(ForbiddenException.class);
        verify(conversationRepository, never()).save(any());
    }

    @Test
    void sendMessage_updatesConversationAndNotifiesRecipient() {
        Conversation conversation = conversation();
        when(conversationRepository.findByIdForUpdate(5L)).thenReturn(Optional.of(conversation));

        ChatMessageResponse response = chatService.sendMessage(5L, PASSENGER, "  Je suis devant la gare  ");

        assertThat(response.content()).isEqualTo("Je suis devant la gare");
        assertThat(conversation.getLastMessagePreview()).isEqualTo("Je suis devant la gare");

        ArgumentCaptor<MessageSentEvent> event = ArgumentCaptor.forClass(MessageSentEvent.class);
        verify(events).publishEvent(event.capture());
        assertThat(event.getValue().recipientId()).isEqualTo(DRIVER);
    }

    @Test
    void sendMessage_rejectsOutsiderAndBlankMessages() {
        when(conversationRepository.findByIdForUpdate(5L)).thenReturn(Optional.of(conversation()));

        assertThatThrownBy(() -> chatService.sendMessage(5L, OUTSIDER, "Bonjour"))
                .isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> chatService.sendMessage(5L, PASSENGER, "   "))
                .isInstanceOf(BusinessException.class);
        verify(messageRepository, never()).save(any());
    }

    @Test
    void markAsRead_publishesReceiptOnlyWhenMessagesWereRead() {
        when(conversationRepository.findById(5L)).thenReturn(Optional.of(conversation()));
        when(messageRepository.markAsRead(eq(5L), eq(DRIVER), any())).thenReturn(0, 3);

        ReadReceipt nothingRead = chatService.markAsRead(5L, DRIVER);
        verify(events, never()).publishEvent(any(Object.class));

        ReadReceipt threeRead = chatService.markAsRead(5L, DRIVER);
        verify(events).publishEvent(threeRead);

        assertThat(nothingRead.updatedCount()).isZero();
        assertThat(threeRead.updatedCount()).isEqualTo(3);
    }

    private static Conversation conversation() {
        Conversation conversation = new Conversation();
        conversation.setId(5L);
        conversation.setTripId(100L);
        conversation.setPassengerId(PASSENGER);
        conversation.setDriverId(DRIVER);
        return conversation;
    }
}
