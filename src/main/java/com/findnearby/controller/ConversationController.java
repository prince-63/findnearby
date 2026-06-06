package com.findnearby.controller;

import com.findnearby.dto.ConversationRequest;
import com.findnearby.dto.ConversationResponse;
import com.findnearby.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/conversation")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ConversationResponse> createConversation(
            @RequestBody ConversationRequest conversationRequest) {
        return ResponseEntity.ok(conversationService.createConversation(conversationRequest));
    }

    @PostMapping("/get")
    public ResponseEntity<ConversationResponse> getConversation(
            @RequestBody ConversationRequest conversationRequest) {
        return ResponseEntity.ok(conversationService.getConversation(conversationRequest));
    }
}
