package com.eventmanager.service;

import com.eventmanager.dto.response.AnalyticsResponse;
import com.eventmanager.dto.response.UserResponse;
import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.mapper.UserMapper;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.EventStatus;
import com.eventmanager.model.enums.Role;
import com.eventmanager.repository.BookingRepository;
import com.eventmanager.repository.EventRepository;
import com.eventmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private EventRepository eventRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private UserMapper userMapper;

    @InjectMocks private AdminService adminService;

    private User admin;

    @BeforeEach
    void setUp() {
        admin = User.builder()
                .id(1L).email("admin@example.com").fullName("Admin").role(Role.ADMIN).isActive(true).build();
    }

    // ── Analytics ──────────────────────────────────────────

    @Test
    void getAnalyticsReturnsAllCounts() {
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByRole(Role.ORGANIZER)).thenReturn(20L);
        when(userRepository.countByRole(Role.ATTENDEE)).thenReturn(80L);
        when(eventRepository.count()).thenReturn(50L);
        when(eventRepository.countByStatus(EventStatus.PUBLISHED)).thenReturn(40L);
        when(bookingRepository.countAll()).thenReturn(500L);
        when(bookingRepository.sumAllRevenue()).thenReturn(25000L);

        AnalyticsResponse response = adminService.getAnalytics();

        assertEquals(100L, response.getTotalUsers());
        assertEquals(20L, response.getTotalOrganizers());
        assertEquals(80L, response.getTotalAttendees());
        assertEquals(50L, response.getTotalEvents());
        assertEquals(40L, response.getPublishedEvents());
        assertEquals(500L, response.getTotalBookings());
        assertEquals(25000L, response.getTotalRevenueCents());
    }

    // ── List Users ─────────────────────────────────────────

    @Test
    void listUsersReturnsPaged() {
        UserResponse userResponse = UserResponse.builder().id(1L).email("u@test.com").build();
        Page<UserResponse> page = new PageImpl<>(List.of(userResponse));

        when(userRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(admin)));
        when(userMapper.toResponse(any(User.class))).thenReturn(userResponse);

        Page<UserResponse> result = adminService.listUsers(PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }

    // ── Change Role ────────────────────────────────────────

    @Test
    void changeUserRoleSuccess() {
        User target = User.builder().id(2L).email("target@example.com").role(Role.ATTENDEE).build();
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(any(User.class))).thenReturn(target);
        when(userMapper.toResponse(any(User.class))).thenReturn(
                UserResponse.builder().id(2L).role(Role.ORGANIZER).build());

        UserResponse response = adminService.changeUserRole(2L, "ORGANIZER", "admin@example.com");

        assertEquals(Role.ORGANIZER, target.getRole());
        verify(userRepository).save(target);
    }

    @Test
    void changeUserRoleNotAdminThrows() {
        User regularUser = User.builder().id(3L).role(Role.ATTENDEE).build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(regularUser));

        assertThrows(AccessDeniedException.class,
                () -> adminService.changeUserRole(2L, "ORGANIZER", "user@example.com"));
    }

    // ── Ban/Unban ──────────────────────────────────────────

    @Test
    void toggleBanSuccess() {
        User target = User.builder().id(2L).isActive(true).build();
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(any(User.class))).thenReturn(target);
        when(userMapper.toResponse(any(User.class))).thenReturn(
                UserResponse.builder().id(2L).isActive(false).build());

        adminService.toggleUserBan(2L, "admin@example.com");

        assertFalse(target.getIsActive()); // was true, now false
        verify(userRepository).save(target);
    }

    @Test
    void toggleBanNotAdminThrows() {
        User regularUser = User.builder().id(3L).role(Role.ATTENDEE).build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(regularUser));

        assertThrows(AccessDeniedException.class,
                () -> adminService.toggleUserBan(2L, "user@example.com"));
    }
}
