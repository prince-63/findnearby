package com.findnearby.controller;

import com.findnearby.dto.*;
import com.findnearby.service.UserProfileService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService service;

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody @Valid SignupRequest request) {
        return service.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest request) {
        return service.login(request);
    }

    @GetMapping("/{userId}")
    public UserProfileResponse getUser(@PathVariable String userId) {
        return service.getUser(userId);
    }

    @PatchMapping("/{userId}")
    public UserProfileResponse updateUser(
            @PathVariable String userId, @RequestBody UpdateProfileRequest request) {
        return service.updateUser(userId, request);
    }

    @PatchMapping("/{userId}/password")
    public void changePassword(
            @PathVariable String userId, @RequestBody ChangePasswordRequest request) {
        service.changePassword(userId, request);
    }

    @PatchMapping("/{userId}/activate")
    public void activateUser(@PathVariable String userId) {
        service.activateUser(userId);
    }

    @PatchMapping("/{userId}/deactivate")
    public void deactivateUser(@PathVariable String userId) {
        service.deactivateUser(userId);
    }

    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable String userId) {
        service.deleteUser(userId);
    }

    @PostMapping("/{userId}/profile-picture/upload")
    public UserProfileResponse uploadUrl(
            @PathVariable String userId, @RequestPart MultipartFile file) {

        return service.uploadProfileImage(userId, file);
    }

    @GetMapping("/{userId}/profile-image")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String userId) {

        return service.getProfileImage(userId);
    }

    @GetMapping("/users")
    public List<UserProfileResponse> getUsers(
            @RequestParam(required = false) String userType,
            @RequestParam(required = false, defaultValue = "10") Long size,
            @RequestParam(required = false, defaultValue = "0") Long page) {
        return service.getUsers(userType, size, page);
    }
}
