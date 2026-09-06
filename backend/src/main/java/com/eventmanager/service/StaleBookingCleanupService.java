package com.eventmanager.service;

import com.eventmanager.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Periodically cancels orphaned PENDING bookings — those created when a user
 * opened the Razorpay modal but never completed payment (browser closed,
 * network drop, etc.). Without cleanup, these block re-booking via the
 * unique constraint on (user_id, event_id).
 */
@Service
public class StaleBookingCleanupService {

    private static final Logger log = LoggerFactory.getLogger(StaleBookingCleanupService.class);

    private final BookingRepository bookingRepository;

    public StaleBookingCleanupService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Run every 5 minutes. Cancel PENDING bookings older than 30 minutes.
     */
    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void cancelStalePendingBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        int cancelled = bookingRepository.cancelStalePendingBookings(cutoff);
        if (cancelled > 0) {
            log.info("Cleaned up {} orphaned PENDING bookings older than 30 minutes", cancelled);
        }
    }
}
