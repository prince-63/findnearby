package com.findnearby.config;

import com.findnearby.service.PresenceService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PresenceChannelInterceptor implements ChannelInterceptor {

    private final PresenceService presenceService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        var accessor = StompHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> userIdHeader = accessor.getNativeHeader("userId");
            if (userIdHeader != null && !userIdHeader.isEmpty()) {
                String userId = userIdHeader.get(0);
                String sessionId = (String) accessor.getSessionId();
                presenceService.userConnected(userId, sessionId);
                accessor.getSessionAttributes().put("userId", userId);
                eventPublisher.publishEvent(new UserConnectedEvent(this, userId));
            }
        }
        return message;
    }
}
