package com.eventmanager.security;

import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory token blacklist for revoked refresh tokens.
 * Tokens are stored with their expiry time and periodically cleaned up.
 *
 * Suitable for single-instance deployment (Render free tier).
 * For multi-instance, use Redis or a shared database table.
 */
@Component
public class TokenBlacklist {

    private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();
    private long lastCleanup = System.currentTimeMillis();
    private static final long CLEANUP_INTERVAL_MS = 300_000; // 5 minutes

    /**
     * Revoke a refresh token so it can no longer be used.
     */
    public void revoke(String token) {
        // Store token with its expiry (7 days from now — max refresh token lifetime)
        revokedTokens.put(token, System.currentTimeMillis() + 604_800_000L);
        maybeCleanup();
    }

    /**
     * Check if a token has been revoked.
     */
    public boolean isRevoked(String token) {
        maybeCleanup();
        Long expiry = revokedTokens.get(token);
        if (expiry == null) return false;
        if (System.currentTimeMillis() > expiry) {
            revokedTokens.remove(token);
            return false;
        }
        return true;
    }

    private synchronized void maybeCleanup() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
        lastCleanup = now;

        Iterator<Map.Entry<String, Long>> it = revokedTokens.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, Long> entry = it.next();
            if (now > entry.getValue()) {
                it.remove();
            }
        }
    }
}
