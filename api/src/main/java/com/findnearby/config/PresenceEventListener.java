package com.findnearby.config;

import com.findnearby.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleConnect(UserConnectedEvent event) {
        messagingTemplate.convertAndSend("/topic/presence/" + event.getUserId(), true);
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String userId = presenceService.userDisconnected(sessionId);
        if (userId != null) {
            messagingTemplate.convertAndSend("/topic/presence/" + userId, false);
        }
    }
}
