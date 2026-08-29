package com.eventmanager.service;

import com.eventmanager.dto.request.CreateBookingRequest;
import com.eventmanager.dto.response.BookingResponse;
import com.eventmanager.exception.DuplicateResourceException;
import com.eventmanager.exception.InsufficientCapacityException;
import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.kafka.event.BookingEvent;
import com.eventmanager.kafka.producer.BookingEventProducer;
import com.eventmanager.mapper.BookingMapper;
import com.eventmanager.model.Booking;
import com.eventmanager.model.Event;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.BookingStatus;
import com.eventmanager.repository.BookingRepository;
import com.eventmanager.repository.EventRepository;
import com.eventmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    @Autowired(required = false)
    private BookingEventProducer bookingEventProducer;

    public BookingService(BookingRepository bookingRepository,
                          EventRepository eventRepository,
                          UserRepository userRepository,
                          BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.getEventId()));

        // Check event is published
        if (event.getStatus() != com.eventmanager.model.enums.EventStatus.PUBLISHED) {
            throw new IllegalArgumentException("Event is not available for booking");
        }

        // Check for existing active booking (prevents duplicate bookings)
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        if (bookingRepository.existsByUserIdAndEventIdAndStatusIn(user.getId(), event.getId(), activeStatuses)) {
            throw new DuplicateResourceException("You already have an active booking for this event");
        }

        // Check capacity with optimistic locking via @Version
        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
        if (!event.hasAvailableCapacity(quantity)) {
            throw new InsufficientCapacityException(event.getAvailableCapacity(), quantity);
        }

        // Update event booked count
        event.setBookedCount(event.getBookedCount() + quantity);
        eventRepository.save(event);

        // Calculate total
        long totalCents = event.getPriceCents() * quantity;

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .quantity(quantity)
                .totalCents(totalCents)
                .status(BookingStatus.CONFIRMED) // Auto-confirm for MVP
                .build();

        booking = bookingRepository.save(booking);

        // ── Kafka: publish booking.created event ──────────────────────
        BookingEvent kafkaEvent = BookingEvent.of(
                booking.getId(),
                user.getId(),
                user.getEmail(),
                event.getId(),
                event.getTitle(),
                quantity,
                totalCents,
                "CONFIRMED"
        );
        if (bookingEventProducer != null) bookingEventProducer.sendBookingEvent(kafkaEvent);

        return bookingMapper.toResponse(booking);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        return bookingRepository.findByUserId(user.getId(), pageable)
                .map(bookingMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != com.eventmanager.model.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("You can only view your own bookings");
        }

        return bookingMapper.toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != com.eventmanager.model.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REFUNDED) {
            throw new IllegalArgumentException("Booking is already cancelled or refunded");
        }

        // Release capacity
        Event event = booking.getEvent();
        event.setBookedCount(Math.max(0, event.getBookedCount() - booking.getQuantity()));
        eventRepository.save(event);

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        // ── Kafka: publish booking.cancelled event ─────────────────────
        BookingEvent kafkaEvent = BookingEvent.of(
                booking.getId(),
                booking.getUser().getId(),
                booking.getUser().getEmail(),
                event.getId(),
                event.getTitle(),
                booking.getQuantity(),
                booking.getTotalCents(),
                "CANCELLED"
        );
        if (bookingEventProducer != null) bookingEventProducer.sendBookingEvent(kafkaEvent);

        return bookingMapper.toResponse(booking);
    }
}
