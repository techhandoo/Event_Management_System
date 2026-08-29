package com.eventmanager.kafka.producer;

import com.eventmanager.kafka.event.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@ConditionalOnBean(KafkaTemplate.class)
public class BookingEventProducer {

    private static final Logger log = LoggerFactory.getLogger(BookingEventProducer.class);
    private static final String TOPIC = "booking.events";

    private final KafkaTemplate<String, BookingEvent> kafkaTemplate;

    public BookingEventProducer(KafkaTemplate<String, BookingEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendBookingEvent(BookingEvent event) {
        log.info("Sending booking event to topic {}: bookingId={}, status={}",
                TOPIC, event.getBookingId(), event.getStatus());

        CompletableFuture<SendResult<String, BookingEvent>> future =
                kafkaTemplate.send(TOPIC, event.getEventId().toString(), event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to send booking event to topic {}: {}", TOPIC, ex.getMessage(), ex);
            } else {
                log.info("Booking event sent successfully to topic {}: partition={}, offset={}",
                        TOPIC,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}
