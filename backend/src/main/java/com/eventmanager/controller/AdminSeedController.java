package com.eventmanager.controller;

import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.dto.response.UserResponse;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.Role;
import com.eventmanager.repository.UserRepository;
import com.eventmanager.security.CookieHelper;
import com.eventmanager.security.JwtTokenProvider;
import com.eventmanager.validation.PasswordValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * One-time admin seed endpoint.
 * Only works if no admin user exists yet AND the correct seed key is provided.
 * Remove or disable this endpoint after creating your first admin.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Admin Seed", description = "One-time admin creation (disable after use)")
public class AdminSeedController {

    private static final Logger log = LoggerFactory.getLogger(AdminSeedController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final CookieHelper cookieHelper;

    @Value("${ADMIN_SEED_KEY:}")
    private String seedKey;

    @Value("${app.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (seedKey == null || seedKey.isBlank()) {
            log.warn("ADMIN_SEED_KEY not set — admin seed endpoint is disabled");
        }
    }

    public AdminSeedController(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                JwtTokenProvider jwtTokenProvider,
                                CookieHelper cookieHelper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.cookieHelper = cookieHelper;
    }

    @PostMapping("/seed-admin")
    @Operation(summary = "Create the first admin user (one-time only)")
    public ResponseEntity<?> seedAdmin(@RequestBody Map<String, String> body,
                                       HttpServletResponse response) {
        // Check if seed key is configured
        if (seedKey == null || seedKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Admin seed endpoint is disabled. Set ADMIN_SEED_KEY env var to enable."));
        }

        // Check if admin already exists
        if (userRepository.existsByRole(Role.ADMIN)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Admin user already exists. This endpoint is disabled."));
        }

        // Verify seed key
        String providedKey = body.get("seedKey");
        if (seedKey == null || seedKey.isEmpty() || !seedKey.equals(providedKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Invalid seed key"));
        }

        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.get("fullName");

        if (email == null || password == null || fullName == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("email, password, and fullName are required"));
        }

        if (!PasswordValidator.isStrong(password)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(PasswordValidator.describeFailures(password)));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email already registered"));
        }

        User admin = User.builder()
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.ADMIN)
                .isActive(true)
                .build();

        admin = userRepository.save(admin);

        // Set tokens as httpOnly cookies
        String accessToken = jwtTokenProvider.generateAccessToken(admin.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(admin.getEmail());
        cookieHelper.setAccessTokenCookie(response, accessToken, accessTokenExpirationMs / 1000);
        cookieHelper.setRefreshTokenCookie(response, refreshToken, refreshTokenExpirationMs / 1000);

        UserResponse userResponse = UserResponse.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .fullName(admin.getFullName())
                .role(admin.getRole())
                .isActive(admin.getIsActive())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin user created successfully", userResponse));
    }
}
