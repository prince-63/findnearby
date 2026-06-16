package com.findnearby.controller;

import com.findnearby.dto.MessageRequest;
import com.findnearby.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/conversations.private.send")
    public void sendMessage(@Valid @Payload MessageRequest request) {
        var message = messageService.processMessage(request);
        messagingTemplate.convertAndSend(
                "/topic/conversations.private/" + request.conversationId(), message);
    }
}
