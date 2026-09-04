package com.eventmanager.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * IP-based rate limiter for auth endpoints.
 * Single responsibility: only handles per-IP request throttling.
 *
 * Limits:
 *   - Login: 5 attempts per minute per IP
 *   - Register: 3 attempts per minute per IP
 *   - Forgot-password: 2 attempts per minute per IP
 *
 * Account lockout is handled separately by AccountLockoutFilter.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, RateBucket> buckets = new ConcurrentHashMap<>();

    private static final int LOGIN_LIMIT = 5;
    private static final int REGISTER_LIMIT = 3;
    private static final int FORGOT_LIMIT = 2;
    private static final long WINDOW_MS = 60_000;
    private static final long CLEANUP_INTERVAL_MS = 300_000;

    private long lastCleanup = System.currentTimeMillis();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        maybeCleanup();

        String path = request.getRequestURI();
        Integer limit = getLimit(path);
        if (limit == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String key = path + ":" + clientIp;
        RateBucket bucket = buckets.computeIfAbsent(key, k -> new RateBucket());

        if (!bucket.tryAcquire(limit, WINDOW_MS)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"Too many requests. Please try again later.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Integer getLimit(String path) {
        if (path.contains("/auth/login")) return LOGIN_LIMIT;
        if (path.contains("/auth/register")) return REGISTER_LIMIT;
        if (path.contains("/auth/forgot-password")) return FORGOT_LIMIT;
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private synchronized void maybeCleanup() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
        lastCleanup = now;

        Iterator<Map.Entry<String, RateBucket>> it = buckets.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, RateBucket> entry = it.next();
            if (now - entry.getValue().windowStart > WINDOW_MS * 2) {
                it.remove();
            }
        }
    }

    private static class RateBucket {
        volatile long windowStart = System.currentTimeMillis();
        final AtomicInteger count = new AtomicInteger(0);

        synchronized boolean tryAcquire(int limit, long windowMs) {
            long now = System.currentTimeMillis();
            if (now - windowStart > windowMs) {
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= limit;
        }
    }
}
