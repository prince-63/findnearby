package com.findnearby.dto;

import jakarta.validation.constraints.NotBlank;

public record PostRequest(
        @NotBlank String finderId,
        @NotBlank String title,
        @NotBlank String description,
        String location,
        Double budgetMin,
        Double budgetMax) {}
