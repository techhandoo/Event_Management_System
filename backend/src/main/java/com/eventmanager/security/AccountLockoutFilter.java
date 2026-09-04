package com.eventmanager.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Account lockout filter — blocks login after 5 failed attempts for 15 minutes.
 *
 * Single responsibility: only handles account-level lockout, not IP-based rate limiting.
 * Works with LoginAttemptTracker which records failures/successes via Spring Security events.
 */
@Component
public class AccountLockoutFilter extends OncePerRequestFilter {

    private final Map<String, Long> loginFailures = new ConcurrentHashMap<>();
    private final Map<String, Long> accountLockouts = new ConcurrentHashMap<>();

    private static final int LOGIN_FAILURE_LIMIT = 5;
    private static final long LOCKOUT_DURATION_MS = 900_000; // 15 minutes
    private static final long CLEANUP_INTERVAL_MS = 300_000;

    private long lastCleanup = System.currentTimeMillis();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        maybeCleanup();

        String path = request.getRequestURI();
        if (!path.contains("/auth/login") || !"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = extractEmailFromBody(request);
        if (email == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Long lockoutExpiry = accountLockouts.get(email.toLowerCase());
        if (lockoutExpiry != null && System.currentTimeMillis() < lockoutExpiry) {
            long secondsRemaining = (lockoutExpiry - System.currentTimeMillis()) / 1000;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"Account temporarily locked. Try again in " + secondsRemaining + " seconds.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    public void recordLoginFailure(String email) {
        String key = email.toLowerCase();

        // Check if lockout has expired
        Long lockoutExpiry = accountLockouts.get(key);
        if (lockoutExpiry != null && System.currentTimeMillis() >= lockoutExpiry) {
            accountLockouts.remove(key);
            loginFailures.remove(key);
        }

        loginFailures.merge(key, 1L, Long::sum);
        if (loginFailures.getOrDefault(key, 0L) >= LOGIN_FAILURE_LIMIT) {
            accountLockouts.put(key, System.currentTimeMillis() + LOCKOUT_DURATION_MS);
            loginFailures.remove(key);
        }
    }

    public void recordLoginSuccess(String email) {
        String key = email.toLowerCase();
        loginFailures.remove(key);
        accountLockouts.remove(key);
    }

    /** Visible for testing */
    public Map<String, Long> getAccountLockouts() { return accountLockouts; }

    /**
     * Safely extract email from login request body.
     * Uses a CachedBodyHttpServletRequest wrapper to allow re-reading.
     */
    private String extractEmailFromBody(HttpServletRequest request) {
        try {
            CachedBodyRequest cached = new CachedBodyRequest(request);
            byte[] body = cached.getCachedBody();
            String bodyStr = new String(body);

            int emailIdx = bodyStr.indexOf("\"email\"");
            if (emailIdx < 0) return null;
            int colonIdx = bodyStr.indexOf(":", emailIdx);
            int startQuote = bodyStr.indexOf("\"", colonIdx + 1);
            int endQuote = bodyStr.indexOf("\"", startQuote + 1);
            if (startQuote < 0 || endQuote < 0) return null;
            return bodyStr.substring(startQuote + 1, endQuote).trim();
        } catch (Exception e) {
            return null;
        }
    }

    private synchronized void maybeCleanup() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
        lastCleanup = now;

        Iterator<Map.Entry<String, Long>> lockIt = accountLockouts.entrySet().iterator();
        while (lockIt.hasNext()) {
            Map.Entry<String, Long> entry = lockIt.next();
            if (now > entry.getValue()) {
                lockIt.remove();
                loginFailures.remove(entry.getKey());
            }
        }
    }

    /**
     * Wraps HttpServletRequest to cache the body, allowing multiple reads.
     * The original stream can only be read once; this caches it.
     */
    private static class CachedBodyRequest extends jakarta.servlet.http.HttpServletRequestWrapper {
        private final byte[] cachedBody;

        CachedBodyRequest(HttpServletRequest request) throws IOException {
            super(request);
            this.cachedBody = request.getInputStream().readAllBytes();
        }

        byte[] getCachedBody() { return cachedBody; }

        @Override
        public ServletInputStream getInputStream() {
            return new ServletInputStream() {
                private int idx = 0;
                @Override public boolean isFinished() { return idx >= cachedBody.length; }
                @Override public boolean isReady() { return true; }
                @Override public void setReadListener(ReadListener listener) {}
                @Override public int read() { return idx < cachedBody.length ? cachedBody[idx++] & 0xFF : -1; }
            };
        }
    }
}
