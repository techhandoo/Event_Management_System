package com.eventmanager.controller;

import com.eventmanager.dto.request.ContactRequest;
import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

    @PostMapping
    @Operation(summary = "Submit a contact message (public)")
    public ResponseEntity<ApiResponse<String>> submit(@Valid @RequestBody ContactRequest request) {
        emailService.sendContactEmail(
                request.getName(),
                request.getEmail(),
                request.getSubject(),
                request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Message sent. We'll get back to you within 24 hours."));
    }
}