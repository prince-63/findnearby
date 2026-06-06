package com.findnearby.dto;

import com.findnearby.enums.ProfileType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SignupRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String mobileNo,
        @NotBlank String password,
        @NotNull ProfileType profileType) {}
