package com.eventmanager.kafka.consumer;

import com.eventmanager.kafka.event.EventEvent;
import com.eventmanager.model.enums.NotificationType;
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
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    private final NotificationService notificationService;

    public NotificationConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 1000, multiplier = 2.0),
        dltStrategy = DltStrategy.ALWAYS_RETRY_ON_ERROR,
        include = { Exception.class }
    )
    @KafkaListener(topics = "event.events", groupId = "notification-service")
    public void handleEventNotification(
            @Payload EventEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        log.info("Processing event lifecycle: eventId={}, title={}, status={}, topic={}, partition={}, offset={}",
                event.getEventId(), event.getTitle(), event.getStatus(), topic, partition, offset);

        try {
            switch (event.getStatus()) {
                case "PUBLISHED" -> {
                    log.info("Event published: \"{}\" (id={}) — would send email blast to subscribers",
                            event.getTitle(), event.getEventId());
                    // In production: query subscribers, send emails via notification.events topic
                }
                case "CANCELLED" -> {
                    log.info("Event cancelled: \"{}\" (id={}) — would notify all attendees",
                            event.getTitle(), event.getEventId());
                    // In production: query all booked users, send cancellation notifications
                }
                default -> log.debug("No notification needed for event status: {}", event.getStatus());
            }

            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process event notification: eventId={}, error={}",
                    event.getEventId(), e.getMessage(), e);
            throw e;
        }
    }
}
