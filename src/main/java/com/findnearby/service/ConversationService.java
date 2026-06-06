package com.findnearby.service;

import static com.findnearby.entity.Conversation.mapToConversation;

import com.findnearby.dto.ConversationRequest;
import com.findnearby.dto.ConversationResponse;
import com.findnearby.entity.Conversation;
import com.findnearby.repository.ConversationRepository;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;

    public ConversationResponse createConversation(ConversationRequest conversationRequest) {
        Optional<Conversation> isConversationExits =
                conversationRepository.findByFinderIdAndBrokerId(
                        conversationRequest.finderId(), conversationRequest.brokerId());
        if (isConversationExits.isPresent()) {
            throw new RuntimeException("Conversation already exits.");
        }
        var conversation = conversationRepository.save(mapToConversation(conversationRequest));
        return new ConversationResponse(
                conversation.getFinderId(), conversation.getBrokerId(), conversation.getId());
    }

    public ConversationResponse getConversation(ConversationRequest conversationRequest) {
        var conversation =
                conversationRepository
                        .findByFinderIdAndBrokerId(
                                conversationRequest.finderId(), conversationRequest.brokerId())
                        .orElseThrow(() -> new RuntimeException("Conversation not found"));
        return new ConversationResponse(
                conversation.getFinderId(), conversation.getBrokerId(), conversation.getId());
    }
}
