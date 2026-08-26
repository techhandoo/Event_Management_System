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

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .fullName("Test User")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("$2a$12$encoded")
                .fullName("Test User")
                .role(Role.ATTENDEE)
                .isActive(true)
                .build();
    }

    // ── Register Tests ─────────────────────────────────────

    @Test
    void registerSuccess() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$12$encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateAccessToken(auth)).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken(auth)).thenReturn("refresh-token");
        when(tokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(userMapper.toResponse(any(User.class))).thenReturn(
                com.eventmanager.dto.response.UserResponse.builder()
                        .id(1L).email("test@example.com").fullName("Test User").role(Role.ATTENDEE).build()
        );

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        verify(userRepository).save(any(User.class));
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void registerDuplicateEmailThrows() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    // ── Login Tests ────────────────────────────────────────

    @Test
    void loginSuccess() {
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateAccessToken(auth)).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken(auth)).thenReturn("refresh-token");
        when(tokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userMapper.toResponse(any(User.class))).thenReturn(
                com.eventmanager.dto.response.UserResponse.builder()
                        .id(1L).email("test@example.com").fullName("Test User").role(Role.ATTENDEE).build()
        );

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    // ── Refresh Token Tests ────────────────────────────────

    @Test
    void refreshTokenSuccess() {
        when(tokenProvider.validateToken("refresh-token")).thenReturn(true);
        when(tokenProvider.getEmailFromToken("refresh-token")).thenReturn("test@example.com");
        when(tokenProvider.generateAccessToken("test@example.com")).thenReturn("new-access-token");
        when(tokenProvider.generateRefreshToken("test@example.com")).thenReturn("new-refresh-token");
        when(tokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userMapper.toResponse(any(User.class))).thenReturn(
                com.eventmanager.dto.response.UserResponse.builder()
                        .id(1L).email("test@example.com").fullName("Test User").role(Role.ATTENDEE).build()
        );

        AuthResponse response = authService.refreshToken("refresh-token");

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
    }

    @Test
    void refreshTokenInvalidThrows() {
        when(tokenProvider.validateToken("invalid-token")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.refreshToken("invalid-token"));
    }
}
