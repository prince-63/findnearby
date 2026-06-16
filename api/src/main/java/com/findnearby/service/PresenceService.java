package com.findnearby.service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class PresenceService {

    private final Map<String, String> userSessions = new ConcurrentHashMap<>();
    private final Map<String, Instant> userLastSeen = new ConcurrentHashMap<>();

    public void userConnected(String userId, String sessionId) {
        userSessions.put(userId, sessionId);
    }

    public String userDisconnected(String sessionId) {
        var entry =
                userSessions.entrySet().stream()
                        .filter(e -> e.getValue().equals(sessionId))
                        .findFirst();
        entry.ifPresent(e -> userLastSeen.put(e.getKey(), Instant.now()));
        entry.ifPresent(e -> userSessions.remove(e.getKey()));
        return entry.map(Map.Entry::getKey).orElse(null);
    }

    public boolean isOnline(String userId) {
        return userSessions.containsKey(userId);
    }

    public Instant getLastSeen(String userId) {
        return userLastSeen.get(userId);
    }
}
