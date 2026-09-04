package com.eventmanager.controller;

import com.eventmanager.dto.request.CreateBookingRequest;
import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.dto.response.BookingResponse;
import com.eventmanager.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse booking = bookingService.createBooking(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", booking));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        size = Math.min(size, 50);
        Page<BookingResponse> bookings = bookingService.getMyBookings(userDetails.getUsername(),
                PageRequest.of(page, size, Sort.by("bookedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse booking = bookingService.getBooking(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse booking = bookingService.cancelBooking(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }
}
