package com.eventmanager.config;

import com.eventmanager.security.AccountLockoutFilter;
import com.eventmanager.security.CookieHelper;
import com.eventmanager.security.JwtAuthenticationFilter;
import com.eventmanager.security.RateLimitFilter;
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
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
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

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:None}")
    private String cookieSameSite;

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
                // CRITICAL: use the NON-Xor handler (SPA pattern).
                // Spring Security 6.1+ defaults to XorCsrfTokenRequestAttributeHandler, which
                // stores a MASKED token in the _csrf attribute. CsrfTokenCookieFilter copies
                // that attribute into the XSRF-TOKEN cookie, so the cookie would hold the
                // masked value while the repository compares against the raw token — every
                // POST fails with 403. The raw-token handler keeps attribute, cookie and
                // header identical so the browser's read-cookie -> send-header flow works.
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                .ignoringRequestMatchers(
                    "/api/auth/login",          // Login has no CSRF token yet
                    "/api/auth/register",       // Registration has no CSRF token yet
                    "/api/auth/refresh",        // Refresh uses cookie, not form
                    "/api/auth/logout",         // Logout uses raw axios, no CSRF token
                    "/api/auth/seed-admin",     // One-time setup, no CSRF token on first visit
                    "/api/auth/forgot-password", // Anonymous flow — no session/cookie to protect
                    "/api/auth/reset-password",  // Anonymous flow — security comes from emailed token
                    "/api/contact",          // Public contact form — no session to protect
                    "/api/webhooks/**"      // Razorpay webhooks
                )
                .csrfTokenRepository(csrfTokenRepository())
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
                .requestMatchers("/api/contact").permitAll() // Public contact form
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            // ── Ensure CSRF token is set on every response ─────
            .addFilterAfter(new CsrfTokenCookieFilter(cookieSecure, cookieSameSite), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(accountLockoutFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return auth.build();
    }

    /**
     * Ensures the CSRF token cookie (XSRF-TOKEN) is set on every response.
     * Spring Security's CookieCsrfTokenRepository only sets it when
     * csrfTokenRepository.loadToken() is called. This filter ensures it's always present.
     *
     * Values are passed via constructor — @Value does NOT inject into classes
     * instantiated with `new` (previously produced a literal "SameSite=null" header
     * which browsers reject).
     */
    private static class CsrfTokenCookieFilter extends OncePerRequestFilter {
        private final boolean cookieSecure;
        private final String cookieSameSite;

        CsrfTokenCookieFilter(boolean cookieSecure, String cookieSameSite) {
            this.cookieSecure = cookieSecure;
            this.cookieSameSite = cookieSameSite;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        jakarta.servlet.FilterChain filterChain)
                throws java.io.IOException, jakarta.servlet.ServletException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
            if (csrfToken != null) {
                // Use addHeader to APPEND, not overwrite existing Set-Cookie headers
                // (auth cookies are set later in the filter chain)
                // SameSite must match app.cookie.same-site (None for cross-origin)
                String header = "XSRF-TOKEN=" + csrfToken.getToken()
                        + "; Path=/; SameSite=" + cookieSameSite;
                if (cookieSecure) header += "; Secure";
                response.addHeader("Set-Cookie", header);
                
                // Expose the token as a custom header so cross-origin frontends can read it
                // (since they cannot read document.cookie across different domains)
                response.setHeader("XSRF-TOKEN", csrfToken.getToken());
            }
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Disable auto-registration of the security filters as GLOBAL servlet filters.
     *
     * CRITICAL: if these @Component filters are auto-registered, they run OUTSIDE
     * Spring Security's FilterChainProxy. The global run authenticates the request,
     * then the security chain clears the stateless SecurityContext and skips its own
     * copy of the filter (OncePerRequestFilter "already filtered" attribute) — so
     * EVERY authenticated request is rejected with 401.
     *
     * NOTE: returning a FilterRegistrationBean[] bean does NOT work — Spring Boot
     * only collects individual RegistrationBean beans, so each filter needs its own.
     */
    // Each filter needs its OWN bean (Spring Boot only collects individual
    // RegistrationBean beans — an array or list bean is silently ignored), so
    // the three beans share this helper.
    private <T extends jakarta.servlet.Filter> FilterRegistrationBean<T> disabledRegistration(T filter) {
        FilterRegistrationBean<T> bean = new FilterRegistrationBean<>(filter);
        bean.setEnabled(false);
        return bean;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
            JwtAuthenticationFilter filter) {
        return disabledRegistration(filter);
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(
            RateLimitFilter filter) {
        return disabledRegistration(filter);
    }

    @Bean
    public FilterRegistrationBean<AccountLockoutFilter> accountLockoutFilterRegistration(
            AccountLockoutFilter filter) {
        return disabledRegistration(filter);
    }

    /**
     * CSRF repository for the SPA double-submit pattern.
     *
     * It only READS the XSRF-TOKEN cookie (to validate the X-XSRF-TOKEN header)
     * and GENERATES new tokens — it deliberately does NOT write its own cookie.
     *
     * Why: CookieCsrfTokenRepository's default writer emits a second XSRF-TOKEN
     * Set-Cookie WITHOUT SameSite (=> Lax-equivalent), which browsers drop on
     * cross-origin POSTs. Two competing Set-Cookie headers for the same cookie
     * made behavior browser-dependent — this was the root cause of "every
     * mutation returns 403 in the browser while curl passes".
     * CsrfTokenCookieFilter is the SINGLE writer, emitting the cookie with
     * SameSite=None; Secure; Path=/ (matching the auth cookies).
     *
     * Note: CookieCsrfTokenRepository is FINAL in Spring Security 6.2, so this
     * delegates to an instance behind the CsrfTokenRepository interface instead
     * of subclassing it.
     */
    @Bean
    public CsrfTokenRepository csrfTokenRepository() {
        return nonWritingCsrfTokenRepository();
    }

    public static CsrfTokenRepository nonWritingCsrfTokenRepository() {
        CookieCsrfTokenRepository delegate = CookieCsrfTokenRepository.withHttpOnlyFalse();
        return new CsrfTokenRepository() {
            @Override
            public CsrfToken generateToken(HttpServletRequest request) {
                return delegate.generateToken(request);
            }

            @Override
            public void saveToken(CsrfToken token,
                                  HttpServletRequest request,
                                  HttpServletResponse response) {
                // no-op — the XSRF-TOKEN cookie is written solely by CsrfTokenCookieFilter
            }

            @Override
            public CsrfToken loadToken(HttpServletRequest request) {
                return delegate.loadToken(request);
            }
        };
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
