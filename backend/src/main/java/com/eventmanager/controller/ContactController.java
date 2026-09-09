package com.eventmanager.controller;

import com.eventmanager.dto.request.ContactRequest;
import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@Tag(name = "Contact", description = "Public contact form")
public class ContactController {

    private final EmailService emailService;

    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    @PostMapping
    @Operation(summary = "Submit a contact message (public)")
    public ResponseEntity<ApiResponse<String>> submit(@Valid @RequestBody ContactRequest request) {
        try {
            emailService.sendContactEmail(
                    request.getName(),
                    request.getEmail(),
                    request.getSubject(),
                    request.getMessage());
            return ResponseEntity.ok(ApiResponse.success("Message sent. We'll get back to you within 24 hours."));
        } catch (RuntimeException e) {
            // Public form: surface a clear error instead of an opaque 500.
            // Typical cause: RESEND_API_KEY unset/invalid in the deploy env.
            log.warn("Contact form submission failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error("Could not send your message right now. Please try again later."));
        }
    }
}