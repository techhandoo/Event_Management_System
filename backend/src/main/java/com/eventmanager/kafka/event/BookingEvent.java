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
public class BookingEvent {

    private Long bookingId;
    private Long userId;
    private String userEmail;
    private Long eventId;
    private String eventTitle;
    private Integer quantity;
    private Long totalCents;
    private String status;
    private LocalDateTime occurredAt;

    public static BookingEvent of(Long bookingId, Long userId, String userEmail,
                                   Long eventId, String eventTitle, Integer quantity,
                                   Long totalCents, String status) {
        return BookingEvent.builder()
                .bookingId(bookingId)
                .userId(userId)
                .userEmail(userEmail)
                .eventId(eventId)
                .eventTitle(eventTitle)
                .quantity(quantity)
                .totalCents(totalCents)
                .status(status)
                .occurredAt(LocalDateTime.now())
                .build();
    }
}
