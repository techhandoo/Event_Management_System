package com.eventmanager.security;

import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.stereotype.Component;

/**
 * Records failed login attempts to feed the AccountLockoutFilter.
 */
@Component
public class LoginFailureTracker implements ApplicationListener<AuthenticationFailureBadCredentialsEvent> {

    private final AccountLockoutFilter lockoutFilter;

    public LoginFailureTracker(AccountLockoutFilter lockoutFilter) {
        this.lockoutFilter = lockoutFilter;
    }

    @Override
    public void onApplicationEvent(AuthenticationFailureBadCredentialsEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if (principal instanceof String email) {
            lockoutFilter.recordLoginFailure(email);
        }
    }
}
