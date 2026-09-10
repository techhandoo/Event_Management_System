package com.eventmanager.controller;

import com.eventmanager.dto.request.ChangeEmailRequest;
import com.eventmanager.dto.request.ChangePasswordRequest;
import com.eventmanager.dto.request.UpdateProfileRequest;
import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.dto.response.UserResponse;
import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.mapper.UserMapper;
import com.eventmanager.model.User;
import com.eventmanager.repository.UserRepository;
import com.eventmanager.security.CookieHelper;
import com.eventmanager.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final CookieHelper cookieHelper;

    @Value("${app.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public UserController(UserRepository userRepository, UserMapper userMapper,
                          PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                          CookieHelper cookieHelper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.cookieHelper = cookieHelper;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(user)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userMapper.toResponse(user)));
    }

    @PutMapping("/me/email")
    public ResponseEntity<ApiResponse<String>> changeEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangeEmailRequest request,
            HttpServletResponse response) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));

        // Verify current password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password");
        }

        // Check if new email is already taken
        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        String newEmail = request.getNewEmail();
        user.setEmail(newEmail);
        userRepository.save(user);

        // Issue new tokens with the new email and set cookies — otherwise the
        // old JWT still carries the old email and the app enters a refresh loop
        // once the access token expires.
        String accessToken = tokenProvider.generateAccessToken(newEmail);
        String refreshToken = tokenProvider.generateRefreshToken(newEmail);
        long accessMaxAge = accessTokenExpirationMs / 1000;
        long refreshMaxAge = refreshTokenExpirationMs / 1000;
        cookieHelper.setAccessTokenCookie(response, accessToken, accessMaxAge);
        cookieHelper.setRefreshTokenCookie(response, refreshToken, refreshMaxAge);

        return ResponseEntity.ok(ApiResponse.success("Email updated successfully"));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect current password");
        }

        // Prevent reusing the same password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from the current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
