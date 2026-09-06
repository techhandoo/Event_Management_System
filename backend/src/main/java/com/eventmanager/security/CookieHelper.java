package com.eventmanager.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Utility for managing httpOnly, Secure, SameSite cookies.
 * Tokens never touch JavaScript — immune to XSS theft.
 */
@Component
public class CookieHelper {

    public static final String ACCESS_TOKEN_COOKIE = "access_token";
    public static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    public static final String CSRF_TOKEN_COOKIE = "XSRF-TOKEN";

    @Value("${app.cookie.secure:true}")
    private boolean secure;

    @Value("${app.cookie.same-site:Strict}")
    private String sameSite;

    /**
     * Set the access token as an httpOnly cookie.
     * Max age matches the JWT expiration (15 minutes default).
     */
    public void setAccessTokenCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        setCookie(response, ACCESS_TOKEN_COOKIE, token, (int) maxAgeSeconds, true);
    }

    /**
     * Set the refresh token as an httpOnly cookie.
     * Longer-lived (7 days default).
     */
    public void setRefreshTokenCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        setCookie(response, REFRESH_TOKEN_COOKIE, token, (int) maxAgeSeconds, true);
    }

    /**
     * Set the CSRF token as a READABLE cookie (not httpOnly).
     * The frontend reads this cookie and sends it back in a header.
     * This is the "double-submit cookie" CSRF pattern.
     */
    public void setCsrfCookie(HttpServletResponse response, String csrfToken) {
        setCookie(response, CSRF_TOKEN_COOKIE, csrfToken, 3600, false);
    }

    /**
     * Clear all auth cookies on logout.
     */
    public void clearAuthCookies(HttpServletResponse response) {
        clearCookie(response, ACCESS_TOKEN_COOKIE);
        clearCookie(response, REFRESH_TOKEN_COOKIE);
    }

    private void setCookie(HttpServletResponse response, String name, String value,
                           int maxAge, boolean httpOnly) {
        // Build Set-Cookie header directly — jakarta.servlet Cookie lacks SameSite support
        StringBuilder sb = new StringBuilder();
        sb.append(name).append("=").append(value);
        sb.append("; Path=/");
        sb.append("; Max-Age=").append(maxAge);
        if (httpOnly) sb.append("; HttpOnly");
        if (secure) sb.append("; Secure");
        sb.append("; SameSite=").append(sameSite);
        response.addHeader("Set-Cookie", sb.toString());
    }

    private void clearCookie(HttpServletResponse response, String name) {
        response.addHeader("Set-Cookie",
                name + "=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=" + sameSite);
    }
}
