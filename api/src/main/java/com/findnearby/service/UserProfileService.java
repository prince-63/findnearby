package com.findnearby.service;

import com.findnearby.dto.*;
import com.findnearby.entity.UserProfile;
import com.findnearby.enums.ProfileType;
import com.findnearby.enums.UserStatus;
import com.findnearby.repository.UserProfileRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository repository;

    @Value("${app.file.base-url}")
    private String baseUrl;

    @Value("${app.storage.upload-dir}")
    private String uploadDir;

    public AuthResponse signup(SignupRequest request) {

        if (repository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        if (repository.existsByMobileNo(request.mobileNo())) {
            throw new RuntimeException("Mobile number already exists");
        }

        UserProfile user =
                UserProfile.builder()
                        .name(request.name())
                        .email(request.email().toLowerCase())
                        .mobileNo(request.mobileNo())
                        .password(request.password().toLowerCase())
                        .profileType(request.profileType())
                        .status(UserStatus.ACTIVE)
                        .build();

        repository.save(user);

        return new AuthResponse(user.getId(), "User registered successfully");
    }

    public AuthResponse login(LoginRequest request) {

        UserProfile user =
                repository
                        .findByEmail(request.email())
                        .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.getPassword().equals(request.password())) {
            throw new RuntimeException("Invalid email or password");
        }

        return new AuthResponse(user.getId(), "Login successful");
    }

    public UserProfileResponse getUser(String userId) {

        UserProfile user = findUser(userId);

        return map(user);
    }

    private UserProfileResponse map(UserProfile user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getMobileNo(),
                user.getProfileType(),
                user.getProfileImageKey(),
                user.getStatus());
    }

    public UserProfileResponse updateUser(String userId, UpdateProfileRequest request) {

        UserProfile user = findUser(userId);

        if (request.name() != null) {
            user.setName(request.name());
        }

        if (request.mobileNo() != null) {

            boolean mobileExists = repository.existsByMobileNo(request.mobileNo());

            if (mobileExists && !request.mobileNo().equals(user.getMobileNo())) {

                throw new RuntimeException("Mobile number already exists");
            }

            user.setMobileNo(request.mobileNo());
        }

        repository.save(user);

        return map(user);
    }

    public void changePassword(String userId, ChangePasswordRequest request) {

        UserProfile user = findUser(userId);

        if (!user.getPassword().equals(request.oldPassword())) {

            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(request.newPassword());

        repository.save(user);
    }

    public void activateUser(String userId) {

        UserProfile user = findUser(userId);

        user.setStatus(UserStatus.ACTIVE);

        repository.save(user);
    }

    public void deactivateUser(String userId) {

        UserProfile user = findUser(userId);

        user.setStatus(UserStatus.INACTIVE);

        repository.save(user);
    }

    public void deleteUser(String userId) {

        UserProfile user = findUser(userId);

        user.setStatus(UserStatus.DELETED);

        repository.save(user);
    }

    public UserProfileResponse uploadProfileImage(String userId, MultipartFile file) {

        UserProfile user = findUser(userId);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path directory = Paths.get(uploadDir, userId);

        Path filePath = directory.resolve(fileName);

        try {

            Files.createDirectories(directory);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }

        user.setProfileImageKey(filePath.toString());

        repository.save(user);

        return map(user);
    }

    private UserProfile findUser(String userId) {
        return repository
                .findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ResponseEntity<Resource> getProfileImage(String userId) {
        UserProfile user = findUser(userId);

        Path filePath = Paths.get(user.getProfileImageKey());

        Resource resource = new FileSystemResource(filePath);

        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(resource);
    }

    public List<UserProfileResponse> getUsers(String userType, Long size, Long page) {
        Pageable pageable = PageRequest.of(page.intValue(), size.intValue());

        Page<UserProfile> users;
        if (userType == null || userType.isBlank()) {
            users = repository.findAll(pageable);
        } else {
            ProfileType profileType = ProfileType.valueOf(userType.toUpperCase());
            users = repository.findByProfileType(profileType, pageable);
        }

        return users.getContent().stream().map(this::map).toList();
    }
}
