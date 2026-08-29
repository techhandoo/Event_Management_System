package com.eventmanager.kafka.producer;

import com.eventmanager.kafka.event.EventEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@ConditionalOnBean(KafkaTemplate.class)
public class EventEventProducer {

    private static final Logger log = LoggerFactory.getLogger(EventEventProducer.class);
    private static final String TOPIC = "event.events";

    private final KafkaTemplate<String, EventEvent> kafkaTemplate;

    public EventEventProducer(KafkaTemplate<String, EventEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendEventEvent(EventEvent event) {
        log.info("Sending event lifecycle event to topic {}: eventId={}, status={}",
                TOPIC, event.getEventId(), event.getStatus());

        CompletableFuture<SendResult<String, EventEvent>> future =
                kafkaTemplate.send(TOPIC, event.getEventId().toString(), event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to send event to topic {}: {}", TOPIC, ex.getMessage(), ex);
            } else {
                log.info("Event lifecycle event sent to topic {}: partition={}, offset={}",
                        TOPIC,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}
