package com.findnearby.dto;

import com.findnearby.enums.MessageFor;
import com.findnearby.enums.MessageType;
import java.time.Instant;

public record MessageResponse(
        String id,
        String senderId,
        String conversationId,
        String content,
        MessageType messageType,
        MessageFor messageFor,
        Instant createdAt) {}
