package com.eventmanager.service;

import com.eventmanager.exception.DuplicateResourceException;
import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.model.Booking;
import com.eventmanager.model.Event;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.BookingStatus;
import com.eventmanager.repository.BookingRepository;
import com.eventmanager.repository.EventRepository;
import com.eventmanager.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final RazorpayClient razorpayClient;
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final String razorpayKeyId;
    private final String razorpayKeySecret;

    public PaymentService(RazorpayClient razorpayClient,
                          BookingRepository bookingRepository,
                          EventRepository eventRepository,
                          UserRepository userRepository,
                          String razorpayKeyId,
                          String razorpayKeySecret) {
        this.razorpayClient = razorpayClient;
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
    }

    @Transactional
    public Map<String, Object> createOrder(Long eventId, int quantity, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        event.validateForBooking(quantity);

        // Prevent duplicate active bookings
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        if (bookingRepository.existsByUserIdAndEventIdAndStatusIn(user.getId(), event.getId(), activeStatuses)) {
            throw new DuplicateResourceException("You already have an active booking for this event");
        }

        long totalCents = event.getPriceCents() * quantity;
        if (totalCents <= 0) {
            throw new IllegalArgumentException("Free events do not require payment");
        }

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", totalCents);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "evt_" + eventId + "_usr_" + user.getId());
            orderRequest.put("notes", Map.of(
                    "eventId", String.valueOf(eventId),
                    "userId", String.valueOf(user.getId()),
                    "eventTitle", event.getTitle()
            ));

            Order order = razorpayClient.orders.create(orderRequest);

            return Map.of(
                    "orderId", order.get("id"),
                    "amount", totalCents,
                    "currency", "INR",
                    "keyId", razorpayKeyId,
                    "eventName", event.getTitle(),
                    "quantity", quantity
            );
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create payment order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Booking verifyPayment(String razorpayOrderId, String razorpayPaymentId,
                                  String razorpaySignature, String userEmail) {
        // Verify HMAC SHA256 signature
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            String expectedSignature = sb.toString();

            if (!expectedSignature.equals(razorpaySignature)) {
                log.warn("Razorpay signature mismatch for order {}", razorpayOrderId);
                throw new IllegalArgumentException("Payment signature verification failed");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error verifying Razorpay signature: {}", e.getMessage());
            throw new RuntimeException("Payment verification error", e);
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Booking booking = bookingRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "razorpayOrderId", razorpayOrderId));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }

        Event event = eventRepository.findByIdForUpdate(booking.getEvent().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", booking.getEvent().getId()));

        event.incrementBookedCount(booking.getQuantity());
        eventRepository.save(event);

        booking.setPaymentId(razorpayPaymentId);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaidAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking createFreeBooking(Long eventId, int quantity, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        event.validateForBooking(quantity);

        event.incrementBookedCount(quantity);
        eventRepository.save(event);

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .quantity(quantity)
                .totalCents(0L)
                .status(BookingStatus.CONFIRMED)
                .paidAt(LocalDateTime.now())
                .build();

        return bookingRepository.save(booking);
    }
}
