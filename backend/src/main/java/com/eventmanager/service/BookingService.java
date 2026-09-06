package com.eventmanager.service;

import com.eventmanager.dto.request.CreateBookingRequest;
import com.eventmanager.dto.response.BookingResponse;
import com.eventmanager.exception.DuplicateResourceException;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

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

    // ── Public API ─────────────────────────────────────────────

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, String userEmail) {
        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
        Booking booking = prepareBooking(request.getEventId(), quantity, userEmail,
                BookingStatus.CONFIRMED);

        eventRepository.save(booking.getEvent());
        booking = bookingRepository.save(booking);

        sendBookingKafkaEvent(booking, booking.getUser(), booking.getEvent(),
                quantity, booking.getTotalCents(), "CONFIRMED");

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

        if (!booking.getUser().getId().equals(user.getId())
                && user.getRole() != com.eventmanager.model.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only view your own bookings");
        }

        return bookingMapper.toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (!booking.getUser().getId().equals(user.getId())
                && user.getRole() != com.eventmanager.model.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.REFUNDED) {
            throw new IllegalArgumentException("Booking is already cancelled or refunded");
        }

        Event event = eventRepository.findByIdForUpdate(booking.getEvent().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id",
                        booking.getEvent().getId()));

        event.releaseCapacity(booking.getQuantity());
        eventRepository.save(event);

        booking.setStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);

        sendBookingKafkaEvent(savedBooking, savedBooking.getUser(), event,
                savedBooking.getQuantity(), savedBooking.getTotalCents(), "CANCELLED");

        return bookingMapper.toResponse(savedBooking);
    }

    // ── Shared logic (package-private for PaymentService) ──────

    /**
     * Shared booking preparation used by both free (createBooking) and paid (PaymentService.createOrder) flows.
     * Validates user/event, checks for duplicates, creates or reactivates a booking.
     * Does NOT persist the event — caller must call eventRepository.save(event).
     * Does NOT persist the booking — caller must call bookingRepository.save(booking).
     */
    Booking prepareBooking(Long eventId, int quantity, String userEmail, BookingStatus targetStatus) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        event.validateForBooking(quantity);

        Optional<Booking> existingBooking = bookingRepository
                .findByUserIdAndEventId(user.getId(), event.getId());

        if (existingBooking.isPresent()) {
            Booking existing = existingBooking.get();
            boolean isTerminal = existing.getStatus() == BookingStatus.CANCELLED
                    || existing.getStatus() == BookingStatus.REFUNDED;

            if (isTerminal) {
                existing.setStatus(targetStatus);
                existing.setQuantity(quantity);
                existing.setTotalCents(event.getPriceCents() * quantity);
                existing.setPaymentId(null);
                existing.setRazorpayOrderId(null);
                if (targetStatus == BookingStatus.CONFIRMED) {
                    existing.setPaidAt(LocalDateTime.now());
                }
                event.incrementBookedCount(quantity);
                return existing;
            }
            throw new DuplicateResourceException(
                    "You already have an active booking for this event");
        }

        event.incrementBookedCount(quantity);

        return Booking.builder()
                .user(user)
                .event(event)
                .quantity(quantity)
                .totalCents(event.getPriceCents() * quantity)
                .status(targetStatus)
                .build();
    }

    // ── Kafka ──────────────────────────────────────────────────

    void sendBookingKafkaEvent(Booking booking, User user, Event event,
                               int quantity, long totalCents, String status) {
        if (bookingEventProducer == null) return;
        try {
            BookingEvent kafkaEvent = BookingEvent.of(
                    booking.getId(), user.getId(), user.getEmail(),
                    event.getId(), event.getTitle(),
                    quantity, totalCents, status
            );
            bookingEventProducer.sendBookingEvent(kafkaEvent);
        } catch (Exception e) {
            log.warn("Failed to send booking Kafka event for booking {}: {}",
                    booking.getId(), e.getMessage());
        }
    }
}
