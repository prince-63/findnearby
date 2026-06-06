package com.findnearby.controller;

import com.findnearby.dto.MessageResponse;
import com.findnearby.service.MessageService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageRestController {

    public final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getAllMessages(
            @RequestParam String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(messageService.getAllMessages(conversationId, page, size));
    }
}
