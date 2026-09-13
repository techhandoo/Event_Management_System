package com.eventmanager.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Logs every request's duration so any latency report can be traced to the
 * exact endpoint in Render logs — no more guessing "which service is slow".
 *
 * Slow requests (> SLOW_THRESHOLD_MS) are logged at WARN with their status so
 * they surface in production (INFO level); normal traffic logs at DEBUG and
 * stays quiet. Registered as a global servlet filter at HIGHEST_PRECEDENCE so
 * the timing covers the full chain, including security filters.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestTimingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestTimingFilter.class);
    private static final long SLOW_THRESHOLD_MS = 1500;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long ms = (System.nanoTime() - start) / 1_000_000;
            if (ms > SLOW_THRESHOLD_MS) {
                log.warn("[SLOW] {} {} -> {} in {} ms",
                        request.getMethod(), request.getRequestURI(), response.getStatus(), ms);
            } else {
                log.debug("{} {} -> {} in {} ms",
                        request.getMethod(), request.getRequestURI(), response.getStatus(), ms);
            }
        }
    }
}
