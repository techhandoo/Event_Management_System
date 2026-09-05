package com.eventmanager.config;

import com.eventmanager.security.AccountLockoutFilter;
import com.eventmanager.security.JwtAuthenticationFilter;
import com.eventmanager.security.RateLimitFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
            .csrf(AbstractHttpConfigurer::disable)
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
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(accountLockoutFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return auth.build();
    }

    /**
     * Disable auto-registration of security filters as servlet filters.
     * They are registered in the SecurityFilterChain via addFilterBefore().
     * Without this, Spring Boot auto-registers @Component filters as servlet filters,
     * causing them to run outside the Spring Security chain.
     */
    @Bean
    public FilterRegistrationBean<Filter> disableAutoRegistration(JwtAuthenticationFilter f) {
        FilterRegistrationBean<Filter> bean = new FilterRegistrationBean<>(f);
        bean.setEnabled(false);
        return bean;
    }

    @Bean
    public FilterRegistrationBean<Filter> disableAutoRegistration2(RateLimitFilter f) {
        FilterRegistrationBean<Filter> bean = new FilterRegistrationBean<>(f);
        bean.setEnabled(false);
        return bean;
    }

    @Bean
    public FilterRegistrationBean<Filter> disableAutoRegistration3(AccountLockoutFilter f) {
        FilterRegistrationBean<Filter> bean = new FilterRegistrationBean<>(f);
        bean.setEnabled(false);
        return bean;
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
        config.setAllowedOriginPatterns(java.util.List.of(origins));
        config.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "Refresh-Token", "Accept", "Origin", "X-Requested-With"));
        config.setExposedHeaders(java.util.List.of("Authorization", "Refresh-Token"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
