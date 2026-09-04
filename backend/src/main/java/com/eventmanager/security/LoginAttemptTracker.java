package com.eventmanager.security;

import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

/**
 * Tracks login failures and successes to feed the AccountLockoutFilter.
 * Listens for Spring Security auth events automatically.
 */
@Component
public class LoginAttemptTracker implements
        ApplicationListener<AuthenticationFailureBadCredentialsEvent>,
        ApplicationListener<AuthenticationSuccessEvent> {

    private final AccountLockoutFilter lockoutFilter;

    public LoginAttemptTracker(AccountLockoutFilter lockoutFilter) {
        this.lockoutFilter = lockoutFilter;
    }

    @Override
    public void onApplicationEvent(AuthenticationFailureBadCredentialsEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if (principal instanceof String email) {
            lockoutFilter.recordLoginFailure(email);
        }
    }

    @Override
    public void onApplicationEvent(AuthenticationSuccessEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if (principal instanceof String email) {
            lockoutFilter.recordLoginSuccess(email);
        }
    }
}
