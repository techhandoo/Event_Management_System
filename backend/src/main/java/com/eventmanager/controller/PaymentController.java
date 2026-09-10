package com.eventmanager.controller;

import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.dto.response.BookingResponse;
import com.eventmanager.mapper.BookingMapper;
import com.eventmanager.service.PaymentService;
import com.razorpay.RazorpayException;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles Razorpay payment endpoints. Auto-discovered by Spring via @RestController.
 * Routes only respond when Razorpay is configured (PaymentService checks RazorpayClient).
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final BookingMapper bookingMapper;

    public PaymentController(PaymentService paymentService, BookingMapper bookingMapper) {
        this.paymentService = paymentService;
        this.bookingMapper = bookingMapper;
    }

    @Data
    public static class CreateOrderRequest {
        @NotNull(message = "Event ID is required")
        private Long eventId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private int quantity = 1;
    }

    @Data
    public static class VerifyPaymentRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(
            @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails)
            throws RazorpayException {
        Map<String, Object> order = paymentService.createOrder(
                request.getEventId(), request.getQuantity(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order created", order));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<BookingResponse>> verifyPayment(
            @RequestBody VerifyPaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var booking = paymentService.verifyPayment(
                request.getRazorpayOrderId(), request.getRazorpayPaymentId(),
                request.getRazorpaySignature(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Payment verified",
                bookingMapper.toResponse(booking)));
    }
}
