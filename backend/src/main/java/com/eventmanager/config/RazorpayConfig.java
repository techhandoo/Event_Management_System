package com.eventmanager.config;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Creates the RazorpayClient bean only when Razorpay keys are configured.
 *
 * PaymentService and PaymentController are now Spring-managed (@Service and
 * 
 * @RestController respectively) — they are auto-discovered by component
 *                 scanning and do NOT need manual bean creation here.
 *
 *                 This class only provides the RazorpayClient, which is
 *                 injected into
 *                 PaymentService via @Autowired.
 */

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
}
