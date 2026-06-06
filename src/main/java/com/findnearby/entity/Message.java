package com.findnearby.entity;

import com.findnearby.dto.MessageRequest;
import com.findnearby.enums.MessageFor;
import com.findnearby.enums.MessageType;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message extends BaseDocument {

    private String conversationId;

    private String senderId;

    private String content;

    private MessageType type;

    private MessageFor messageFor;

    public static Message mapToMessage(MessageRequest request) {
        return Message.builder()
                .senderId(request.senderId())
                .conversationId(request.conversationId())
                .content(request.content())
                .type(request.messageType())
                .messageFor(request.messageFor())
                .build();
    }
}
