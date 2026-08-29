package com.eventmanager.service;

import com.eventmanager.dto.request.CreateEventRequest;
import com.eventmanager.dto.request.UpdateEventRequest;
import com.eventmanager.dto.response.EventResponse;
import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.kafka.producer.EventEventProducer;
import com.eventmanager.mapper.EventMapper;
import com.eventmanager.model.Event;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.EventStatus;
import com.eventmanager.model.enums.Role;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock private EventRepository eventRepository;
    @Mock private UserRepository userRepository;
    @Mock private EventMapper eventMapper;
    @Mock private EventEventProducer eventEventProducer;

    @InjectMocks private EventService eventService;

    private User organizer;
    private Event event;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(eventService, "eventEventProducer", eventEventProducer);

        organizer = User.builder()
                .id(1L).email("org@example.com").fullName("Org User").role(Role.ORGANIZER).isActive(true).build();

        event = Event.builder()
                .id(10L).organizer(organizer).title("Test Event").description("Desc")
                .venue("Venue").city("City").startTime(LocalDateTime.now().plusDays(7))
                .endTime(LocalDateTime.now().plusDays(8)).capacity(100).bookedCount(0)
                .priceCents(5000L).status(EventStatus.DRAFT).category("Conference").build();
    }

    // ── Create Event ───────────────────────────────────────

    @Test
    void createEventSuccess() {
        CreateEventRequest request = CreateEventRequest.builder()
                .title("Test Event").venue("Venue").city("City")
                .startTime(LocalDateTime.now().plusDays(7))
                .endTime(LocalDateTime.now().plusDays(8))
                .capacity(100).priceCents(5000L).build();

        when(userRepository.findByEmail("org@example.com")).thenReturn(Optional.of(organizer));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(eventMapper.toResponse(any(Event.class))).thenReturn(
                EventResponse.builder().id(10L).title("Test Event").build());

        EventResponse response = eventService.createEvent(request, "org@example.com");

        assertNotNull(response);
        assertEquals("Test Event", response.getTitle());
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void createEventUserNotFoundThrows() {
        CreateEventRequest request = CreateEventRequest.builder()
                .title("Test Event").venue("V").city("C")
                .startTime(LocalDateTime.now()).endTime(LocalDateTime.now().plusHours(1)).capacity(10).build();

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> eventService.createEvent(request, "unknown@example.com"));
    }

    // ── Publish Event ──────────────────────────────────────

    @Test
    void publishEventSuccess() {
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(userRepository.findByEmail("org@example.com")).thenReturn(Optional.of(organizer));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(eventMapper.toResponse(any(Event.class))).thenReturn(
                EventResponse.builder().id(10L).title("Test Event").status(EventStatus.PUBLISHED).build());

        EventResponse response = eventService.publishEvent(10L, "org@example.com");

        assertEquals(EventStatus.PUBLISHED, event.getStatus());
        verify(eventEventProducer).sendEventEvent(any());
    }

    @Test
    void publishEventNotDraftThrows() {
        event.setStatus(EventStatus.PUBLISHED);
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(userRepository.findByEmail("org@example.com")).thenReturn(Optional.of(organizer));

        assertThrows(IllegalArgumentException.class,
                () -> eventService.publishEvent(10L, "org@example.com"));
    }

    @Test
    void publishEventNotOwnerThrows() {
        User other = User.builder().id(99L).email("other@example.com").role(Role.ORGANIZER).build();
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));

        assertThrows(AccessDeniedException.class,
                () -> eventService.publishEvent(10L, "other@example.com"));
    }

    // ── Delete Event ───────────────────────────────────────

    @Test
    void deleteEventSuccess() {
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(userRepository.findByEmail("org@example.com")).thenReturn(Optional.of(organizer));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        eventService.deleteEvent(10L, "org@example.com");

        assertEquals(EventStatus.CANCELLED, event.getStatus());
        verify(eventEventProducer).sendEventEvent(any());
    }

    // ── List Events ────────────────────────────────────────

    @Test
    void listEventsReturnsPagedResults() {
        Page<Event> page = new PageImpl<>(List.of(event));
        when(eventRepository.findByStatus(eq(EventStatus.PUBLISHED), any())).thenReturn(page);
        when(eventMapper.toResponse(any(Event.class))).thenReturn(
                EventResponse.builder().id(10L).title("Test Event").build());

        var result = eventService.listEvents(null, null, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }

    // ── Search ─────────────────────────────────────────────

    @Test
    void searchEventsReturnsResults() {
        Page<Event> page = new PageImpl<>(List.of(event));
        when(eventRepository.searchEvents(eq("Test"), any())).thenReturn(page);
        when(eventMapper.toResponse(any(Event.class))).thenReturn(
                EventResponse.builder().id(10L).title("Test Event").build());

        var result = eventService.searchEvents("Test", PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
    }
}
