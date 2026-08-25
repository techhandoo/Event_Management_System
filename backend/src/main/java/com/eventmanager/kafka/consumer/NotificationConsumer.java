package com.eventmanager.kafka.consumer;

import com.eventmanager.kafka.event.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    @KafkaListener(topics = "booking.events", groupId = "notification-service")
    public void handleBookingNotification(BookingEvent event) {
        log.info("Notification service received event: bookingId={}, status={}",
                event.getBookingId(), event.getStatus());

        switch (event.getStatus()) {
            case "CONFIRMED" -> {
                log.info("Sending booking confirmation email to: {}", event.getUserEmail());
                // In production: send email via SMTP or email service
            }
            case "CANCELLED" -> {
                log.info("Sending booking cancellation email to: {}", event.getUserEmail());
                // In production: send cancellation email
            }
            default -> log.debug("No notification needed for status: {}", event.getStatus());
        }
    }
}
