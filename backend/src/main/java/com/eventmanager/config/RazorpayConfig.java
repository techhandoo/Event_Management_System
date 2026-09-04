package com.eventmanager.config;

import com.eventmanager.controller.PaymentController;
import com.eventmanager.repository.BookingRepository;
import com.eventmanager.repository.EventRepository;
import com.eventmanager.repository.UserRepository;
import com.eventmanager.service.PaymentService;
import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "razorpay.key.id")
public class RazorpayConfig {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }

    @Bean
    public PaymentService paymentService(RazorpayClient razorpayClient,
                                          BookingRepository bookingRepository,
                                          EventRepository eventRepository,
                                          UserRepository userRepository) {
        return new PaymentService(razorpayClient, bookingRepository, eventRepository,
                userRepository, keyId, keySecret);
    }

    @Bean
    public PaymentController paymentController(PaymentService paymentService) {
        return new PaymentController(paymentService);
    }
}
