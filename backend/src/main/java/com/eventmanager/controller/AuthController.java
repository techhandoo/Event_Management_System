package com.eventmanager.controller;

import com.eventmanager.dto.request.ForgotPasswordRequest;
import com.eventmanager.dto.request.LoginRequest;
import com.eventmanager.dto.request.RegisterRequest;
import com.eventmanager.dto.request.ResetPasswordRequest;
import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.dto.response.UserResponse;
import com.eventmanager.dto.response.ValidateTokenResponse;
import com.eventmanager.security.AuditLogger;
import com.eventmanager.security.CookieHelper;
import com.eventmanager.security.JwtTokenProvider;
import com.eventmanager.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Registration, login, and password management")
public class AuthController {

    private final AuthService authService;
    private final CookieHelper cookieHelper;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogger auditLogger;

    @Value("${app.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public AuthController(AuthService authService,
                          CookieHelper cookieHelper,
                          JwtTokenProvider tokenProvider,
                          AuditLogger auditLogger) {
        this.authService = authService;
        this.cookieHelper = cookieHelper;
        this.tokenProvider = tokenProvider;
        this.auditLogger = auditLogger;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        var result = authService.registerWithTokens(request);
        setAuthCookies(response, result.accessToken(), result.refreshToken());
        auditLogger.logRegister(request.getEmail(), httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", result.user()));
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in with email and password")
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            var result = authService.loginWithTokens(request);
            setAuthCookies(response, result.accessToken(), result.refreshToken());
            auditLogger.logLogin(request.getEmail(), httpRequest.getRemoteAddr(), true);
            return ResponseEntity.ok(ApiResponse.success("Login successful", result.user()));
        } catch (Exception e) {
            auditLogger.logLogin(request.getEmail(), httpRequest.getRemoteAddr(), false);
            throw e;
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token from cookie")
    public ResponseEntity<ApiResponse<UserResponse>> refreshToken(
            @CookieValue(value = CookieHelper.REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("No refresh token"));
        }
        var result = authService.refreshWithTokens(refreshToken);
        setAuthCookies(response, result.accessToken(), result.refreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", result.user()));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset email")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists with that email, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token from email")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout — revoke refresh token and clear cookies")
    public ResponseEntity<ApiResponse<String>> logout(
            @CookieValue(value = CookieHelper.REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
            HttpServletResponse response) {
        authService.logout(refreshToken);
        cookieHelper.clearAuthCookies(response);
        auditLogger.logLogout("user");
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/validate-reset-token")
    @Operation(summary = "Check if a password reset token is valid")
    public ResponseEntity<ApiResponse<ValidateTokenResponse>> validateResetToken(
            @RequestParam String token) {
        ValidateTokenResponse response = authService.validateResetToken(token);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email address using token from verification email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
    }

    // ── Internal helpers ───────────────────────────────────────

    private void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        long accessMaxAge = accessTokenExpirationMs / 1000;
        long refreshMaxAge = refreshTokenExpirationMs / 1000;
        cookieHelper.setAccessTokenCookie(response, accessToken, accessMaxAge);
        cookieHelper.setRefreshTokenCookie(response, refreshToken, refreshMaxAge);
    }
}
