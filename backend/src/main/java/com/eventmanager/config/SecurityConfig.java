package com.eventmanager.config;

import com.eventmanager.security.AccountLockoutFilter;
import com.eventmanager.security.CookieHelper;
import com.eventmanager.security.JwtAuthenticationFilter;
import com.eventmanager.security.RateLimitFilter;
import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;
    private final AccountLockoutFilter accountLockoutFilter;

    @Value("${app.security.csp.connect-src:}")
    private String cspConnectSrc;

    @Value("${app.security.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          RateLimitFilter rateLimitFilter,
                          AccountLockoutFilter accountLockoutFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitFilter = rateLimitFilter;
        this.accountLockoutFilter = accountLockoutFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        String connectSrc = cspConnectSrc.isBlank()
            ? "'self'"
            : "'self' " + cspConnectSrc;

        var auth = http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // ── CSRF: double-submit cookie pattern ─────────────
            // Spring reads the XSRF-TOKEN cookie and validates
            // the X-XSRF-TOKEN header on state-changing requests.
            .csrf(csrf -> csrf
                .ignoringRequestMatchers(
                    "/api/auth/login",    // Login has no CSRF token yet
                    "/api/auth/register", // Registration has no CSRF token yet
                    "/api/auth/refresh",  // Refresh uses cookie, not form
                    "/api/webhooks/**"    // Razorpay webhooks
                )
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            // ── Headers ────────────────────────────────────────
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .httpStrictTransportSecurity(hsts -> hsts
                    .maxAgeInSeconds(63072000)
                    .includeSubDomains(true)
                    .preload(true)
                )
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; " +
                    "script-src 'self' https://checkout.razorpay.com https://*.razorpay.com; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "font-src 'self' https://fonts.gstatic.com; " +
                    "img-src 'self' data: https:; " +
                    "connect-src " + connectSrc + "; " +
                    "frame-src https://*.razorpay.com; " +
                    "frame-ancestors 'none'"
                ))
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .permissionsPolicy(permissions -> permissions.policy(
                    "camera=(), microphone=(), geolocation=(), payment=(self)"
                ))
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"Authentication required\"}"
                    );
                })
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/{id:\\d+}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/{id:\\d+}/availability").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/uptime").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            // ── Ensure CSRF token is set on every response ─────
            .addFilterAfter(new CsrfTokenCookieFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(accountLockoutFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return auth.build();
    }

    /**
     * Ensures the CSRF token cookie (XSRF-TOKEN) is set on every response.
     * Spring Security's CookieCsrfTokenRepository only sets it when
     * csrfTokenRepository.loadToken() is called. This filter ensures it's always present.
     */
    private static class CsrfTokenCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        jakarta.servlet.FilterChain filterChain)
                throws java.io.IOException, jakarta.servlet.ServletException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
            if (csrfToken != null) {
                // Use addHeader to APPEND, not overwrite existing Set-Cookie headers
                // (auth cookies are set later in the filter chain)
                response.addHeader("Set-Cookie",
                        "XSRF-TOKEN=" + csrfToken.getToken()
                        + "; Path=/; SameSite=Strict");
            }
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Disable auto-registration of security filters as servlet filters.
     */
    @Bean
    public FilterRegistrationBean<Filter>[] disableFilterAutoRegistration(
            JwtAuthenticationFilter jwt,
            RateLimitFilter rateLimit,
            AccountLockoutFilter lockout) {
        @SuppressWarnings("unchecked")
        FilterRegistrationBean<Filter>[] beans = new FilterRegistrationBean[3];
        int i = 0;
        for (Filter filter : new Filter[]{jwt, rateLimit, lockout}) {
            FilterRegistrationBean<Filter> bean = new FilterRegistrationBean<>(filter);
            bean.setEnabled(false);
            beans[i++] = bean;
        }
        return beans;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        String[] origins = allowedOrigins.split(",");
        config.setAllowedOriginPatterns(Arrays.asList(origins));
        config.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-XSRF-TOKEN", "Accept", "Origin"));
        config.setExposedHeaders(java.util.List.of("XSRF-TOKEN"));
        config.setAllowCredentials(true); // Required for cookies
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
