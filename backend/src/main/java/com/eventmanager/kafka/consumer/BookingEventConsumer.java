package com.eventmanager.kafka.consumer;

import com.eventmanager.kafka.event.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class BookingEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(BookingEventConsumer.class);

    @KafkaListener(topics = "booking.events", groupId = "booking-service")
    public void handleBookingEvent(BookingEvent event) {
        log.info("Received booking event: bookingId={}, userId={}, eventId={}, status={}",
                event.getBookingId(), event.getUserId(), event.getEventId(), event.getStatus());

        switch (event.getStatus()) {
            case "CONFIRMED" -> {
                log.info("Processing confirmed booking: bookingId={}", event.getBookingId());
                // In production: update analytics, send email via notification topic
            }
            case "CANCELLED" -> {
                log.info("Processing cancelled booking: bookingId={}", event.getBookingId());
                // In production: process refund, update analytics
            }
            default -> log.warn("Unknown booking status: {}", event.getStatus());
        }
    }
}
