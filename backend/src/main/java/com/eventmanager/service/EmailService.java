package com.eventmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${app.email.resend-api-key}")
    private String resendApiKey;

    @Value("${app.email.from-address}")
    private String fromAddress;

    @Value("${app.email.frontend-url}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

        String htmlBody = buildPasswordResetHtml(resetUrl);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = Map.of(
                "from", fromAddress,
                "to", new String[]{ toEmail },
                "subject", "Reset your Eventry password",
                "html", htmlBody
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Password reset email sent to {}", toEmail);
            } else {
                log.error("Failed to send email: {}", response.getBody());
            }
        } catch (Exception e) {
            log.error("Error sending password reset email to {}: {}", toEmail, e.getMessage());
            // Don't throw — user shouldn't know if email failed (security)
        }
    }

    private String buildPasswordResetHtml(String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,system-ui,sans-serif;">
                <div style="max-width:500px;margin:40px auto;background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
                    <div style="background:#4f46e5;padding:32px;text-align:center;">
                        <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">Eventry</h1>
                    </div>
                    <div style="padding:32px;">
                        <h2 style="color:#0f172a;margin:0 0 16px;font-size:20px;">Reset your password</h2>
                        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
                            We received a request to reset your password. Click the button below to create a new password.
                            This link expires in 1 hour.
                        </p>
                        <a href="%s" style="display:inline-block;background:#4f46e5;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                            Reset Password
                        </a>
                        <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:24px 0 0;">
                            If you didn't request this, you can safely ignore this email. Your password won't change until you create a new one.
                        </p>
                    </div>
                    <div style="padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
                        <p style="color:#94a3b8;font-size:11px;margin:0;">Eventry — The modern event management platform</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(resetUrl);
    }
}
