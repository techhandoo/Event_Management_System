package com.eventmanager.integration;

import com.eventmanager.dto.request.CreateBookingRequest;
import com.eventmanager.dto.request.CreateEventRequest;
import com.eventmanager.dto.request.RegisterRequest;
import com.eventmanager.dto.response.AuthResponse;
import com.eventmanager.dto.response.BookingResponse;
import com.eventmanager.dto.response.EventResponse;
import com.eventmanager.model.enums.BookingStatus;
import com.eventmanager.model.enums.EventStatus;
import com.eventmanager.service.AuthService;
import com.eventmanager.service.BookingService;
import com.eventmanager.service.EventService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test that spins up real PostgreSQL and Kafka containers
 * and tests the full booking workflow end-to-end.
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EventBookingIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("eventry_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired private AuthService authService;
    @Autowired private EventService eventService;
    @Autowired private BookingService bookingService;

    private static String organizerToken;
    private static String attendeeToken;
    private static Long eventId;

    @Test
    @Order(1)
    void registerOrganizer() {
        RegisterRequest request = RegisterRequest.builder()
                .email("organizer@test.com")
                .password("password123")
                .fullName("Test Organizer")
                .build();

        AuthResponse response = authService.register(request);
        organizerToken = response.getAccessToken();

        assertNotNull(organizerToken);
        assertFalse(organizerToken.isEmpty());
    }

    @Test
    @Order(2)
    void registerAttendee() {
        RegisterRequest request = RegisterRequest.builder()
                .email("attendee@test.com")
                .password("password123")
                .fullName("Test Attendee")
                .build();

        AuthResponse response = authService.register(request);
        attendeeToken = response.getAccessToken();

        assertNotNull(attendeeToken);
    }

    @Test
    @Order(3)
    void createEvent() {
        CreateEventRequest request = CreateEventRequest.builder()
                .title("Integration Test Event")
                .description("Testing the full booking flow")
                .venue("Test Venue")
                .city("Test City")
                .startTime(LocalDateTime.now().plusDays(30))
                .endTime(LocalDateTime.now().plusDays(31))
                .capacity(5)
                .priceCents(1000L)
                .category("Conference")
                .build();

        EventResponse response = eventService.createEvent(request, "organizer@test.com");
        eventId = response.getId();

        assertNotNull(eventId);
        assertEquals("Integration Test Event", response.getTitle());
        assertEquals(5, response.getAvailableCapacity());
    }

    @Test
    @Order(4)
    void publishEvent() {
        EventResponse response = eventService.publishEvent(eventId, "organizer@test.com");

        assertEquals(EventStatus.PUBLISHED, response.getStatus());
    }

    @Test
    @Order(5)
    void bookEvent() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .eventId(eventId)
                .quantity(2)
                .build();

        BookingResponse response = bookingService.createBooking(request, "attendee@test.com");

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        assertEquals(2, response.getQuantity());
        assertEquals(2000L, response.getTotalCents());
    }

    @Test
    @Order(6)
    void bookingDuplicateThrows() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .eventId(eventId)
                .quantity(1)
                .build();

        assertThrows(com.eventmanager.exception.DuplicateResourceException.class,
                () -> bookingService.createBooking(request, "attendee@test.com"));
    }

    @Test
    @Order(7)
    void cancelBookingReleasesCapacity() {
        var bookings = bookingService.getMyBookings("attendee@test.com",
                org.springframework.data.domain.PageRequest.of(0, 10));
        Long bookingId = bookings.getContent().get(0).getId();

        BookingResponse response = bookingService.cancelBooking(bookingId, "attendee@test.com");

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
    }

    @Test
    @Order(8)
    void eventAvailabilityUpdatedAfterCancel() {
        int availability = eventService.getAvailability(eventId);

        assertEquals(5, availability);
    }
}
