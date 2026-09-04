package com.eventmanager.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Strips server technology disclosure headers (Server, X-Powered-By)
 * from all responses to prevent information leakage.
 * Uses a response wrapper to intercept header writes.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeaderFilter extends OncePerRequestFilter {

    private static final java.util.Set<String> BLOCKED_HEADERS = java.util.Set.of(
        "Server", "X-Powered-By"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(request, new SuppressHeadersResponseWrapper(response));
    }

    /**
     * Wrapper that intercepts setHeader/addHeader calls and suppresses
     * server technology headers regardless of when they're set.
     */
    private static class SuppressHeadersResponseWrapper extends HttpServletResponseWrapper {

        private final Map<String, String> suppressedHeaders = new HashMap<>();

        SuppressHeadersResponseWrapper(HttpServletResponse response) {
            super(response);
        }

        @Override
        public void setHeader(String name, String value) {
            if (BLOCKED_HEADERS.contains(name)) {
                suppressedHeaders.put(name.toLowerCase(), "");
                super.setHeader(name, "");
            } else {
                super.setHeader(name, value);
            }
        }

        @Override
        public void addHeader(String name, String value) {
            if (BLOCKED_HEADERS.contains(name)) {
                suppressedHeaders.put(name.toLowerCase(), "");
                super.setHeader(name, "");
            } else {
                super.addHeader(name, value);
            }
        }

        @Override
        public void sendError(int sc) throws IOException {
            stripBlockedHeaders();
            super.sendError(sc);
        }

        @Override
        public void sendError(int sc, String msg) throws IOException {
            stripBlockedHeaders();
            super.sendError(sc, msg);
        }

        @Override
        public void sendRedirect(String location) throws IOException {
            stripBlockedHeaders();
            super.sendRedirect(location);
        }

        @Override
        public void setStatus(int sc) {
            stripBlockedHeaders();
            super.setStatus(sc);
        }

        private void stripBlockedHeaders() {
            for (String header : suppressedHeaders.keySet()) {
                super.setHeader(capitalize(header), "");
            }
        }

        private String capitalize(String s) {
            if (s == null || s.isEmpty()) return s;
            return s.substring(0, 1).toUpperCase() + s.substring(1);
        }
    }
}
