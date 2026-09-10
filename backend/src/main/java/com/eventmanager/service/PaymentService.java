package com.eventmanager.service;

import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.model.Booking;
import com.eventmanager.model.Event;
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
import java.util.Map;
import java.util.Optional;

public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final RazorpayClient razorpayClient;
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;
    private final String razorpayKeyId;
    private final String razorpayKeySecret;

    public PaymentService(
            RazorpayClient razorpayClient,
            BookingRepository bookingRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            BookingService bookingService,
            String razorpayKeyId,
            String razorpayKeySecret) {
        this.razorpayClient = razorpayClient;
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.bookingService = bookingService;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
    }

    // rollbackFor=Exception.class: RazorpayException is a CHECKED exception, and
    // Spring's default rollback policy only rolls back on RuntimeException/Error.
    // Without this, a failed Razorpay order leaves the PENDING booking and the
    // capacity increment committed — the attendee is then permanently blocked
    // from booking that event ("already have an active booking").
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createOrder(Long eventId, int quantity, String userEmail)
            throws RazorpayException {

        Booking booking = bookingService.prepareBooking(
                eventId, quantity, userEmail, BookingStatus.PENDING);

        long totalCents = booking.getTotalCents();
        if (totalCents <= 0) {
            throw new IllegalArgumentException("Free events do not require payment");
        }

        booking = bookingRepository.save(booking);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", totalCents);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt",
                "evt_" + eventId + "_usr_" + booking.getUser().getId());
        orderRequest.put("notes", Map.of(
                "eventId", String.valueOf(eventId),
                "userId", String.valueOf(booking.getUser().getId()),
                "eventTitle", booking.getEvent().getTitle()
        ));

        Order order = razorpayClient.orders.create(orderRequest);
        String orderId = order.get("id");

        booking.setRazorpayOrderId(orderId);
        bookingRepository.save(booking);

        return Map.of(
                "orderId", orderId,
                "amount", totalCents,
                "currency", "INR",
                "keyId", razorpayKeyId,
                "eventName", booking.getEvent().getTitle(),
                "quantity", quantity
        );
    }

    @Transactional
    public Booking verifyPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature,
            String userEmail) {

        verifyHmacSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "email", userEmail));

        Booking booking = bookingRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking", "razorpayOrderId", razorpayOrderId));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Unauthorized");
        }

        Event event = eventRepository
                .findByIdForUpdate(booking.getEvent().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Event", "id", booking.getEvent().getId()));

        event.incrementBookedCount(booking.getQuantity());
        eventRepository.save(event);

        booking.setPaymentId(razorpayPaymentId);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaidAt(LocalDateTime.now());
        Booking confirmed = bookingRepository.save(booking);

        evictEventCache(event.getId());
        return confirmed;
    }

    private void verifyHmacSignature(
            String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"));
            byte[] hash = mac.doFinal(
                    payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            String expected = sb.toString();
            if (!expected.equals(signature)) {
                log.warn("Razorpay signature mismatch for order {}", orderId);
                throw new IllegalArgumentException(
                        "Payment signature verification failed");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error computing Razorpay HMAC: {}",
                    e.getMessage(), e);
            throw new IllegalStateException(
                    "Payment verification error", e);
        }
    }

    private void evictEventCache(Long eventId) {
        // Best-effort eviction: if a CacheManager is ever wired (e.g. local dev
        // with Redis), evict here. Prod has no cache manager — the next event
        // read hits the DB directly and gets fresh data.
        log.debug("Event cache eviction skipped: no CacheManager wired (prod has no Redis)");
    }
}
