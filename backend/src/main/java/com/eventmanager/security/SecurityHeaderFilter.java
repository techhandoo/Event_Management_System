package com.eventmanager.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Strips server technology disclosure headers (Server, X-Powered-By)
 * from all responses to prevent information leakage.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeaderFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Remove server technology headers
        response.setHeader("Server", "");
        response.setHeader("X-Powered-By", "");

        filterChain.doFilter(request, response);
    }
}
