package com.findnearby.entity;

import com.findnearby.dto.ConversationRequest;
import java.time.Instant;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "conversations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation extends BaseDocument {

    private String finderId;

    private String brokerId;

    private Instant lastMessageAt;

    public static Conversation mapToConversation(ConversationRequest conversationRequest) {
        return Conversation.builder()
                .finderId(conversationRequest.finderId())
                .brokerId(conversationRequest.brokerId())
                .build();
    }
}
