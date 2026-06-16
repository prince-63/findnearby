package com.findnearby.dto;

import com.findnearby.enums.ProfileType;
import com.findnearby.enums.UserStatus;

public record UserProfileResponse(
        String id,
        String name,
        String email,
        String mobileNo,
        ProfileType profileType,
        String profileImageKey,
        UserStatus status,
        Double latitude,
        Double longitude) {}
