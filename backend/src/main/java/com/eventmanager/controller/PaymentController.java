package com.eventmanager.controller;

import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.model.Booking;
import com.eventmanager.service.PaymentService;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(\"/api/payments\")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @Data
    public static class CreateOrderRequest {
        @NotNull(message = \"Event ID is required\")
        private Long eventId;

        @Min(value = 1, message = \"Quantity must be at least 1\")
        private int quantity = 1;
    }

    @Data
    public static class VerifyPaymentRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }

    /**
     * Create a Razorpay order for a paid event.
     * For free events, use /api/bookings directly.
     */
    @PostMapping(\"/create-order\")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(
            @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> order = paymentService.createOrder(
                request.getEventId(), request.getQuantity(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(\"Order created\", order));
    }

    /**
     * Verify payment after Razorpay checkout completes.
     * Updates booking status to CONFIRMED.
     */
    @PostMapping(\"/verify\")
    public ResponseEntity<ApiResponse<Booking>> verifyPayment(
            @RequestBody VerifyPaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Booking booking = paymentService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(\"Payment verified\", booking));
    }
}
