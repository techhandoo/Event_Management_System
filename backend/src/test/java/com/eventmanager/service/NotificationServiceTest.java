package com.eventmanager.service;

import com.eventmanager.dto.response.NotificationResponse;
import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.model.Notification;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.NotificationType;
import com.eventmanager.model.enums.Role;
import com.eventmanager.repository.NotificationRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private NotificationService notificationService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L).email("user@example.com").fullName("User").role(Role.ATTENDEE).build();
    }

    // ── Get Notifications ──────────────────────────────────

    @Test
    void getMyNotificationsReturnsPaged() {
        Notification notification = Notification.builder()
                .id(1L).user(user).type(NotificationType.BOOKING_CONFIRMED)
                .title("Booked!").message("You booked an event").isRead(false)
                .createdAt(LocalDateTime.now()).build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(eq(1L), any()))
                .thenReturn(new PageImpl<>(List.of(notification)));

        Page<NotificationResponse> result = notificationService.getMyNotifications("user@example.com", PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals("Booked!", result.getContent().get(0).getTitle());
    }

    @Test
    void getMyNotificationsUserNotFoundThrows() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.getMyNotifications("unknown@example.com", PageRequest.of(0, 10)));
    }

    // ── Unread Count ───────────────────────────────────────

    @Test
    void getUnreadCountReturnsCount() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        long count = notificationService.getUnreadCount("user@example.com");

        assertEquals(5L, count);
    }

    // ── Mark All Read ──────────────────────────────────────

    @Test
    void markAllAsReadCallsRepository() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.markAllAsReadByUserId(1L)).thenReturn(3);

        notificationService.markAllAsRead("user@example.com");

        verify(notificationRepository).markAllAsReadByUserId(1L);
    }

    // ── Create Notification ────────────────────────────────

    @Test
    void createNotificationSavesToDb() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(new Notification());

        notificationService.createNotification(user, NotificationType.BOOKING_CONFIRMED, "Title", "Message");

        verify(notificationRepository).save(argThat(n ->
                n.getTitle().equals("Title") &&
                n.getMessage().equals("Message") &&
                n.getType() == NotificationType.BOOKING_CONFIRMED &&
                n.getIsRead() == false
        ));
    }
}
