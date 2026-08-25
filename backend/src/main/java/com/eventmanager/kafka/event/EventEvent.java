package com.eventmanager.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventEvent {

    private Long eventId;
    private Long organizerId;
    private String title;
    private String status;
    private LocalDateTime occurredAt;

    public static EventEvent of(Long eventId, Long organizerId, String title, String status) {
        return EventEvent.builder()
                .eventId(eventId)
                .organizerId(organizerId)
                .title(title)
                .status(status)
                .occurredAt(LocalDateTime.now())
                .build();
    }
}
