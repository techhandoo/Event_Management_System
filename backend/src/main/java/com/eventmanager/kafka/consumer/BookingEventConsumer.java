package com.eventmanager.kafka.consumer;

import com.eventmanager.kafka.event.BookingEvent;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.NotificationType;
import com.eventmanager.repository.UserRepository;
import com.eventmanager.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.kafka.retrytopic.DltStrategy;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

@Component
public class BookingEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(BookingEventConsumer.class);

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public BookingEventConsumer(NotificationService notificationService,
                                 UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 1000, multiplier = 2.0),
        dltStrategy = DltStrategy.ALWAYS_RETRY_ON_ERROR,
        include = { Exception.class }
    )
    @KafkaListener(topics = "booking.events", groupId = "booking-service")
    public void handleBookingEvent(
            @Payload BookingEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        log.info("Processing booking event: bookingId={}, status={}, topic={}, partition={}, offset={}",
                event.getBookingId(), event.getStatus(), topic, partition, offset);

        try {
            User user = userRepository.findByEmail(event.getUserEmail()).orElse(null);

            if (user == null) {
                log.warn("User not found for email={}, skipping notification", event.getUserEmail());
                acknowledgment.acknowledge();
                return;
            }

            switch (event.getStatus()) {
                case "CONFIRMED" -> {
                    notificationService.createNotification(
                        user,
                        NotificationType.BOOKING_CONFIRMED,
                        "Booking Confirmed!",
                        String.format("Your booking for \"%s\" (x%d) has been confirmed. Total: $%.2f",
                                event.getEventTitle(),
                                event.getQuantity(),
                                event.getTotalCents() / 100.0)
                    );
                    log.info("Notification created: booking confirmed for user={}, bookingId={}",
                            user.getEmail(), event.getBookingId());
                }
                case "CANCELLED" -> {
                    notificationService.createNotification(
                        user,
                        NotificationType.BOOKING_CONFIRMED,
                        "Booking Cancelled",
                        String.format("Your booking for \"%s\" has been cancelled. Refund of $%.2f will be processed.",
                                event.getEventTitle(),
                                event.getTotalCents() / 100.0)
                    );
                    log.info("Notification created: booking cancelled for user={}, bookingId={}",
                            user.getEmail(), event.getBookingId());
                }
                default -> log.warn("Unknown booking status in Kafka event: {}", event.getStatus());
            }

            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process booking event: bookingId={}, error={}",
                    event.getBookingId(), e.getMessage(), e);
            throw e; // Let retry mechanism handle it
        }
    }
}
