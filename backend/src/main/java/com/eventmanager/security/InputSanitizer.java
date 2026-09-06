package com.eventmanager.security;

import org.springframework.stereotype.Component;

/**
 * Sanitizes user-generated content to prevent stored XSS attacks.
 * Strips HTML tags and dangerous characters while preserving readable text.
 */
@Component
public class InputSanitizer {

    /**
     * Strip HTML tags and encode special characters.
     * Used for user-generated content: event titles, descriptions, names, etc.
     */
    public String sanitize(String input) {
        if (input == null) return null;
        return input
                // Strip HTML tags
                .replaceAll("<[^>]*>", "")
                // Encode dangerous characters
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;")
                // Remove null bytes
                .replace("\0", "")
                // Trim
                .trim();
    }

    /**
     * Sanitize but allow basic formatting (line breaks, spaces).
     * Used for descriptions where formatting is desired.
     */
    public String sanitizeRich(String input) {
        if (input == null) return null;
        return input
                // Strip all HTML tags except line breaks
                .replaceAll("<(?!br/?>|/br>)[^>]*>", "")
                .replace("<script", "&lt;script")
                .replace("javascript:", "")
                .replace("onerror=", "")
                .replace("onload=", "")
                .replace("onclick=", "")
                .replace("\0", "")
                .trim();
    }
}
