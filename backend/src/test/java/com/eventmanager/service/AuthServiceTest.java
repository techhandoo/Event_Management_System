package com.eventmanager.service;

import com.eventmanager.dto.request.LoginRequest;
import com.eventmanager.dto.request.RegisterRequest;
import com.eventmanager.dto.response.AuthResponse;
import com.eventmanager.exception.DuplicateResourceException;
import com.eventmanager.mapper.UserMapper;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.Role;
import com.eventmanager.repository.UserRepository;
import com.eventmanager.security.JwtTokenProvider;
import com.eventmanager.security.TokenBlacklist;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private UserMapper userMapper;
    @Mock private TokenBlacklist tokenBlacklist;

    @InjectMocks private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .email("test@example.com").password("password123").fullName("Test User").build();
        loginRequest = LoginRequest.builder()
                .email("test@example.com").password("password123").build();
        user = User.builder()
                .id(1L).email("test@example.com").passwordHash("$2a$12$encoded")
                .fullName("Test User").role(Role.ATTENDEE).isActive(true).build();
    }

    @Test
    void registerSuccess() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$12$encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(tokenProvider.generateAccessToken("test@example.com")).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken("test@example.com")).thenReturn("refresh-token");
        when(tokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(userMapper.toResponse(any(User.class))).thenReturn(
                com.eventmanager.dto.response.UserResponse.builder()
                        .id(1L).email("test@example.com").fullName("Test User").role(Role.ATTENDEE).build());

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        verify(userRepository).save(any(User.class));
        verifyNoInteractions(authenticationManager);
    }

    @Test
    void registerDuplicateEmailThrows() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginSuccess() {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("test@example.com");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateAccessToken("test@example.com")).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken("test@example.com")).thenReturn("refresh-token");
        when(tokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userMapper.toResponse(any(User.class))).thenReturn(
                com.eventmanager.dto.response.UserResponse.builder()
                        .id(1L).email("test@example.com").fullName("Test User").role(Role.ATTENDEE).build());

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void refreshTokenSuccess() {
        when(tokenBlacklist.isRevoked("refresh-token")).thenReturn(false);
        when(tokenProvider.validateToken("refresh-token")).thenReturn(true);
        when(tokenProvider.getEmailFromToken("refresh-token")).thenReturn("test@example.com");
        when(tokenProvider.generateAccessToken("test@example.com")).thenReturn("new-access-token");
        when(tokenProvider.generateRefreshToken("test@example.com")).thenReturn("new-refresh-token");
        when(tokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userMapper.toResponse(any(User.class))).thenReturn(
                com.eventmanager.dto.response.UserResponse.builder()
                        .id(1L).email("test@example.com").fullName("Test User").role(Role.ATTENDEE).build());

        AuthResponse response = authService.refreshToken("refresh-token");

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        verify(tokenBlacklist).revoke("refresh-token");
    }

    @Test
    void refreshTokenInvalidThrows() {
        when(tokenBlacklist.isRevoked("invalid-token")).thenReturn(false);
        when(tokenProvider.validateToken("invalid-token")).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () -> authService.refreshToken("invalid-token"));
    }

    @Test
    void refreshTokenRevokedThrows() {
        when(tokenBlacklist.isRevoked("revoked-token")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> authService.refreshToken("revoked-token"));
        verifyNoInteractions(tokenProvider);
    }
}
