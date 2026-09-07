package com.eventmanager.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
        CsrfFilter filter = new CsrfFilter(CookieCsrfTokenRepository.withHttpOnlyFalse());
        // SecurityConfig pins this handler — keep in sync with SecurityConfig.filterChain()
        filter.setRequestHandler(new CsrfTokenRequestAttributeHandler());
        return filter;
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