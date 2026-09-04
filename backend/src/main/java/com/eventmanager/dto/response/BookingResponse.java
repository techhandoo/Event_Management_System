package com.eventmanager.dto.response;

import com.eventmanager.model.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;
    private Long userId;
    private Long eventId;
    private String eventTitle;
    private String eventVenue;
    private Integer quantity;
    private Long totalCents;
    private BookingStatus status;
    private String paymentId;
    private String razorpayOrderId;
    private String paymentMethod;
    private LocalDateTime paidAt;
    private LocalDateTime bookedAt;
}
