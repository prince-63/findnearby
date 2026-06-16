package com.findnearby.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateLocationRequest(@NotNull Double latitude, @NotNull Double longitude) {}
