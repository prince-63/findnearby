package com.findnearby.service;

import com.findnearby.dto.MessageRequest;
import com.findnearby.dto.MessageResponse;
import com.findnearby.entity.Message;
import com.findnearby.repository.MessageRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageResponse processMessage(MessageRequest request) {
        var message = messageRepository.save(Message.mapToMessage(request));
        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getContent(),
                message.getType(),
                message.getMessageFor(),
                message.getCreatedAt());
    }

    public List<MessageResponse> getAllMessages(
            String conversationId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());

        return messageRepository.findByConversationId(conversationId, pageable).stream()
                .map(this::map)
                .toList();
    }

    public MessageResponse map(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getContent(),
                message.getType(),
                message.getMessageFor(),
                message.getCreatedAt());
    }
}
