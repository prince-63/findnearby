package com.findnearby.dto;

import com.findnearby.enums.PostStatus;
import java.time.Instant;

public record PostResponse(
        String id,
        String finderId,
        String finderName,
        String finderProfileImageKey,
        String title,
        String description,
        String location,
        Double budgetMin,
        Double budgetMax,
        PostStatus status,
        Instant createdAt) {}
