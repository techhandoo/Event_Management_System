package com.eventmanager.service;

import com.eventmanager.dto.request.CreateBookingRequest;
import com.eventmanager.dto.response.BookingResponse;
import com.eventmanager.exception.DuplicateResourceException;
import com.eventmanager.exception.InsufficientCapacityException;
import com.eventmanager.kafka.producer.BookingEventProducer;
import com.eventmanager.mapper.BookingMapper;
import com.eventmanager.model.Booking;
import com.eventmanager.model.Event;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.BookingStatus;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private EventRepository eventRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookingMapper bookingMapper;
    @Mock private BookingEventProducer bookingEventProducer;

    @InjectMocks private BookingService bookingService;

    private User user;
    private Event event;
    private CreateBookingRequest bookingRequest;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "bookingEventProducer", bookingEventProducer);

        user = User.builder()
                .id(1L).email("user@example.com").fullName("User").role(Role.ATTENDEE).isActive(true).build();

        event = Event.builder()
                .id(10L).organizer(User.builder().id(2L).role(Role.ORGANIZER).build())
                .title("Test Event").venue("Venue").city("City")
                .startTime(LocalDateTime.now().plusDays(7))
                .endTime(LocalDateTime.now().plusDays(8))
                .capacity(100).bookedCount(10).priceCents(5000L)
                .status(EventStatus.PUBLISHED).build();

        bookingRequest = CreateBookingRequest.builder()
                .eventId(10L).quantity(2).build();
    }

    @Test
    void createBookingSuccess() {
        Booking booking = Booking.builder()
                .id(1L).user(user).event(event).quantity(2)
                .totalCents(10000L).status(BookingStatus.CONFIRMED).build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq(1L), eq(10L), anyList())).thenReturn(false);
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(
                BookingResponse.builder().id(1L).status(BookingStatus.CONFIRMED).build());

        BookingResponse response = bookingService.createBooking(bookingRequest, "user@example.com");

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        assertEquals(12, event.getBookedCount());
        verify(bookingEventProducer).sendBookingEvent(any());
    }

    @Test
    void createBookingDuplicateThrows() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq(1L), eq(10L), anyList())).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> bookingService.createBooking(bookingRequest, "user@example.com"));
    }

    @Test
    void createBookingInsufficientCapacityThrows() {
        event.setCapacity(15);
        event.setBookedCount(14);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq(1L), eq(10L), anyList())).thenReturn(false);

        assertThrows(InsufficientCapacityException.class,
                () -> bookingService.createBooking(bookingRequest, "user@example.com"));
    }

    @Test
    void createBookingEventNotPublishedThrows() {
        event.setStatus(EventStatus.DRAFT);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(event));

        assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(bookingRequest, "user@example.com"));
    }

    @Test
    void cancelBookingSuccess() {
        Booking booking = Booking.builder()
                .id(1L).user(user).event(event).quantity(2)
                .totalCents(10000L).status(BookingStatus.CONFIRMED).build();
        event.setBookedCount(50);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(
                BookingResponse.builder().id(1L).status(BookingStatus.CANCELLED).build());

        BookingResponse response = bookingService.cancelBooking(1L, "user@example.com");

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
        assertEquals(48, event.getBookedCount());
        verify(bookingEventProducer).sendBookingEvent(any());
    }

    @Test
    void cancelBookingAlreadyCancelledThrows() {
        Booking booking = Booking.builder()
                .id(1L).user(user).event(event).status(BookingStatus.CANCELLED).build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> bookingService.cancelBooking(1L, "user@example.com"));
    }
}
