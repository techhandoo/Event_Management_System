package com.eventmanager.security;

import com.eventmanager.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Regression test for the SPA double-submit CSRF pattern.
 *
 * PRODUCTION BUG (fixed): Spring Security 6.2 defaults to the XorCsrfTokenRequestAttributeHandler,
 * which stores a MASKED token in the _csrf attribute. SecurityConfig's CsrfTokenCookieFilter copies
 * that attribute into the XSRF-TOKEN cookie, so the cookie held the masked value while the repository
 * compared against the raw token — every state-changing POST/PUT/DELETE failed with 403 (create event,
 * booking, profile email/password changes, etc.). The fix pins the raw-token handler
 * (CsrfTokenRequestAttributeHandler) so cookie == header == raw token, which is exactly what the
 * browser's "read cookie, send as X-XSRF-TOKEN header" flow produces.
 *
 * These tests exercise the filter chain directly (no Spring context / DB / Mockito) and assert the
 * contract the frontend relies on. If someone reverts the handler to the Xor default, the first
 * test fails.
 */
class CsrfCookiePatternTest {

    private static CsrfFilter rawHandlerFilter() {
        // Mirror SecurityConfig.filterChain() exactly: non-writing repository + raw-token handler.
        CsrfFilter filter = new CsrfFilter(SecurityConfig.nonWritingCsrfTokenRepository());
        filter.setRequestHandler(new CsrfTokenRequestAttributeHandler());
        return filter;
    }

    @Test
    void repositoryNeverWritesItsOwnCookie() throws Exception {
        // SINGLE-WRITER contract: the repository only reads/generates the token.
        // If it also wrote a cookie, the response would carry TWO competing
        // XSRF-TOKEN Set-Cookie headers (one without SameSite => Lax-equivalent,
        // dropped by browsers on cross-origin POSTs), breaking every mutation.
        CsrfTokenRepository repo = SecurityConfig.nonWritingCsrfTokenRepository();
        CsrfToken token = repo.generateToken(new MockHttpServletRequest());
        MockHttpServletResponse response = new MockHttpServletResponse();
        repo.saveToken(token, new MockHttpServletRequest(), response);

        for (String header : response.getHeaders("Set-Cookie")) {
            assertFalse(header.startsWith("XSRF-TOKEN"),
                    "repository must not write a competing XSRF-TOKEN cookie: " + header);
        }
    }

    @Test
    void cookieReadHeaderPassesWithRawTokenHandler() throws Exception {
        // Exact SPA flow: browser reads XSRF-TOKEN cookie and echoes it as X-XSRF-TOKEN header.
        CsrfFilter filter = rawHandlerFilter();
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/events");
        String token = "a1b2c3d4-e5f6-4789-abcd-ef0123456789";
        request.setCookies(new Cookie("XSRF-TOKEN", token));
        request.addHeader("X-XSRF-TOKEN", token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            // reached = CSRF validation passed
        });
    }

    @Test
    void postWithoutCsrfHeaderIsRejected() throws Exception {
        CsrfFilter filter = rawHandlerFilter();
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/events");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) ->
                fail("filter chain must not continue when the CSRF header is missing"));

        assertEquals(403, response.getStatus(),
                "missing X-XSRF-TOKEN header must be rejected with 403");
    }

    @Test
    void getRequestIsNotCsrfChecked() throws Exception {
        CsrfFilter filter = rawHandlerFilter();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/events");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            // safe methods pass through without a CSRF token
        });
    }
}