package com.smartride.ratingchat.services;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


import com.smartride.ratingchat.dto.ChatMessageResponse;
import com.smartride.ratingchat.dto.ConversationResponse;
import com.smartride.ratingchat.dto.OpenConversationRequest;
import com.smartride.ratingchat.dto.PageResponse;
import com.smartride.ratingchat.dto.ReadReceipt;
import com.smartride.ratingchat.dto.UnreadCount;
import com.smartride.ratingchat.dto.UnreadCountResponse;
import com.smartride.ratingchat.entities.ChatMessage;
import com.smartride.ratingchat.entities.Conversation;
import com.smartride.ratingchat.events.MessageSentEvent;
import com.smartride.ratingchat.exceptions.BusinessException;
import com.smartride.ratingchat.exceptions.ForbiddenException;
import com.smartride.ratingchat.exceptions.ResourceNotFoundException;
import com.smartride.ratingchat.repositories.ChatMessageRepository;
import com.smartride.ratingchat.repositories.ConversationRepository;
import com.smartride.ratingchat.utils.Timestamps;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Logique du chat, commune a l'API REST et au WebSocket.
 * Les diffusions temps reel sont declenchees par des evenements (voir ChatEventListener).
 */
@Service
@Transactional(readOnly = true)
public class ChatService {

    private static final int PREVIEW_LENGTH = 100;

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final ApplicationEventPublisher events;

    public ChatService(ConversationRepository conversationRepository, ChatMessageRepository messageRepository,
            ApplicationEventPublisher events) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.events = events;
    }

    /** Renvoie la conversation existante ou la cree (appel idempotent). */
    @Transactional
    public ConversationResponse openConversation(Long userId, OpenConversationRequest request) {
        if (request.passengerId().equals(request.driverId())) {
            throw new BusinessException("Le passager et le conducteur doivent etre deux personnes differentes");
        }
        if (!userId.equals(request.passengerId()) && !userId.equals(request.driverId())) {
            throw new ForbiddenException("Vous devez etre le passager ou le conducteur pour ouvrir cette conversation");
        }

        Conversation conversation = conversationRepository
                .findByTripIdAndPassengerIdAndDriverId(request.tripId(), request.passengerId(), request.driverId())
                .orElseGet(() -> {
                    Conversation created = new Conversation();
                    created.setTripId(request.tripId());
                    created.setPassengerId(request.passengerId());
                    created.setDriverId(request.driverId());
                    return conversationRepository.save(created);
                });
        return toResponse(conversation, userId);
    }

    public List<ConversationResponse> getConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findAllForUser(userId);
        if (conversations.isEmpty()) {
            return List.of();
        }
        Map<Long, Long> unread = messageRepository
                .countUnreadByConversation(conversations.stream().map(Conversation::getId).toList(), userId)
                .stream()
                .collect(Collectors.toMap(UnreadCount::conversationId, UnreadCount::total));
        return conversations.stream()
                .map(c -> ConversationResponse.from(c, userId, unread.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    public ConversationResponse getConversation(Long conversationId, Long userId) {
        return toResponse(requireParticipant(conversationId, userId), userId);
    }

    public PageResponse<ChatMessageResponse> getMessages(Long conversationId, Long userId, Pageable pageable) {
        requireParticipant(conversationId, userId);
        return PageResponse.from(messageRepository.findByConversationId(conversationId, pageable)
                .map(ChatMessageResponse::from));
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long conversationId, Long senderId, String content) {
        String text = content == null ? "" : content.trim();
        if (text.isEmpty()) {
            throw new BusinessException("Le message ne peut pas etre vide");
        }
        if (text.length() > ChatMessage.MAX_LENGTH) {
            throw new BusinessException("Le message ne doit pas depasser " + ChatMessage.MAX_LENGTH + " caracteres");
        }

        // Verrou : deux envois simultanes dans la meme conversation sont traites l'un apres l'autre
        Conversation conversation = checkParticipant(conversationRepository.findByIdForUpdate(conversationId),
                conversationId, senderId);

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSenderId(senderId);
        message.setContent(text);
        messageRepository.save(message);

        conversation.setLastMessagePreview(text.length() > PREVIEW_LENGTH ? text.substring(0, PREVIEW_LENGTH) + "..." : text);
        conversation.setLastMessageAt(message.getSentAt());

        ChatMessageResponse response = ChatMessageResponse.from(message);
        events.publishEvent(new MessageSentEvent(response, conversation.otherParticipant(senderId)));
        return response;
    }

    /** Marque comme lus les messages recus par readerId dans cette conversation. */
    @Transactional
    public ReadReceipt markAsRead(Long conversationId, Long readerId) {
        requireParticipant(conversationId, readerId);
        LocalDateTime now = Timestamps.now();
        int updated = messageRepository.markAsRead(conversationId, readerId, now);

        ReadReceipt receipt = new ReadReceipt(conversationId, readerId, updated, now);
        if (updated > 0) {
            events.publishEvent(receipt);
        }
        return receipt;
    }

    public UnreadCountResponse getUnreadCount(Long userId) {
        return new UnreadCountResponse(userId, messageRepository.countUnreadForUser(userId));
    }

    public boolean isParticipant(Long conversationId, Long userId) {
        return conversationRepository.findById(conversationId)
                .map(c -> c.hasParticipant(userId))
                .orElse(false);
    }

    public Conversation requireParticipant(Long conversationId, Long userId) {
        return checkParticipant(conversationRepository.findById(conversationId), conversationId, userId);
    }

    private static Conversation checkParticipant(Optional<Conversation> found, Long conversationId, Long userId) {
        Conversation conversation = found
                .orElseThrow(() -> new ResourceNotFoundException("Conversation " + conversationId + " introuvable"));
        if (!conversation.hasParticipant(userId)) {
            throw new ForbiddenException("Vous ne participez pas a cette conversation");
        }
        return conversation;
    }

    private ConversationResponse toResponse(Conversation conversation, Long viewerId) {
        long unread = messageRepository.countUnreadByConversation(List.of(conversation.getId()), viewerId).stream()
                .mapToLong(UnreadCount::total)
                .sum();
        return ConversationResponse.from(conversation, viewerId, unread);
    }
}
