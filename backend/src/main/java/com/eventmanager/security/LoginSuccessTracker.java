package com.eventmanager.security;

import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

/**
 * Records successful login attempts to clear lockout state.
 */
@Component
public class LoginSuccessTracker implements ApplicationListener<AuthenticationSuccessEvent> {

    private final AccountLockoutFilter lockoutFilter;

    public LoginSuccessTracker(AccountLockoutFilter lockoutFilter) {
        this.lockoutFilter = lockoutFilter;
    }

    @Override
    public void onApplicationEvent(AuthenticationSuccessEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if (principal instanceof String email) {
            lockoutFilter.recordLoginSuccess(email);
        }
    }
}
