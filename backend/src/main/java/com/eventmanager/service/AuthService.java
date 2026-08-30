package com.eventmanager.service;

import com.eventmanager.dto.request.*;
import com.eventmanager.dto.response.AuthResponse;
import com.eventmanager.dto.response.UserResponse;
import com.eventmanager.dto.response.ValidateTokenResponse;
import com.eventmanager.exception.DuplicateResourceException;
import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.mapper.UserMapper;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.Role;
import com.eventmanager.repository.UserRepository;
import com.eventmanager.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final EmailService emailService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       UserMapper userMapper,
                       EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        // Determine role — only ATTENDEE and ORGANIZER allowed via self-registration
        Role role = Role.ATTENDEE;
        if (request.getRole() != null) {
            try {
                Role requested = Role.valueOf(request.getRole().toUpperCase());
                if (requested == Role.ATTENDEE || requested == Role.ORGANIZER) {
                    role = requested;
                }
            } catch (IllegalArgumentException ignored) { /* default to ATTENDEE */ }
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return AuthResponse.of(accessToken, refreshToken, tokenProvider.getAccessTokenExpirationMs(),
                userMapper.toResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.of(accessToken, refreshToken, tokenProvider.getAccessTokenExpirationMs(),
                userMapper.toResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        String newAccessToken = tokenProvider.generateAccessToken(email);
        String newRefreshToken = tokenProvider.generateRefreshToken(email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.of(newAccessToken, newRefreshToken, tokenProvider.getAccessTokenExpirationMs(),
                userMapper.toResponse(user));
    }

    // ── Password Reset ─────────────────────────────────────────

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), token);
        });
        // Always return success (don't reveal if email exists)
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public ValidateTokenResponse validateResetToken(String token) {
        return userRepository.findByResetToken(token)
                .map(user -> {
                    if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
                        return ValidateTokenResponse.builder()
                                .valid(true)
                                .email(maskEmail(user.getEmail()))
                                .message("Token is valid")
                                .build();
                    }
                    return ValidateTokenResponse.builder()
                            .valid(false)
                            .message("Token has expired")
                            .build();
                })
                .orElse(ValidateTokenResponse.builder()
                        .valid(false)
                        .message("Invalid token")
                        .build());
    }

    /**
     * Mask email for display: "j***@example.com"
     * Prevents email enumeration via the validate-reset-token endpoint.
     */
    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) return email;
        String local = email.substring(0, 1);
        String domain = email.substring(atIndex);
        return local + "***" + domain;
    }
}
