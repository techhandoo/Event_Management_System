package com.eventmanager.mapper;

import com.eventmanager.dto.response.BookingResponse;
import com.eventmanager.model.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) return null;
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .eventId(booking.getEvent().getId())
                .eventTitle(booking.getEvent().getTitle())
                .eventVenue(booking.getEvent().getVenue())
                .quantity(booking.getQuantity())
                .totalCents(booking.getTotalCents())
                .status(booking.getStatus())
                .paymentId(booking.getPaymentId())
                .razorpayOrderId(booking.getRazorpayOrderId())
                .paymentMethod(booking.getPaymentMethod())
                .paidAt(booking.getPaidAt())
                .bookedAt(booking.getBookedAt())
                .build();
    }
}
