package com.findnearby.dto;

import com.findnearby.enums.MessageFor;
import com.findnearby.enums.MessageType;

public record MessageRequest(
        String senderId,
        String conversationId,
        String content,
        MessageType messageType,
        MessageFor messageFor) {}
