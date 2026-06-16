package com.findnearby.controller;

import com.findnearby.dto.PresenceResponse;
import com.findnearby.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/presence")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping("/{userId}")
    public ResponseEntity<PresenceResponse> getPresence(@PathVariable String userId) {
        boolean online = presenceService.isOnline(userId);
        return ResponseEntity.ok(
                new PresenceResponse(userId, online, presenceService.getLastSeen(userId)));
    }
}
