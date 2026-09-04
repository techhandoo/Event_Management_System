package com.eventmanager.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AccountLockoutTest {

    private AccountLockoutFilter filter;

    @BeforeEach
    void setUp() {
        filter = new AccountLockoutFilter();
    }

    @Test
    void firstFourFailuresDoNotLock() {
        for (int i = 0; i < 4; i++) {
            filter.recordLoginFailure("user@test.com");
        }
        Long lockout = filter.getAccountLockouts().get("user@test.com");
        assertNull(lockout, "Should not be locked after 4 failures");
    }

    @Test
    void fifthFailureLocksAccount() {
        for (int i = 0; i < 5; i++) {
            filter.recordLoginFailure("user@test.com");
        }
        Long lockout = filter.getAccountLockouts().get("user@test.com");
        assertNotNull(lockout, "Should be locked after 5 failures");
        assertTrue(lockout > System.currentTimeMillis(), "Lockout should be in the future");
    }

    @Test
    void successClearsFailureCount() {
        filter.recordLoginFailure("user@test.com");
        filter.recordLoginFailure("user@test.com");
        filter.recordLoginSuccess("user@test.com");
        Long lockout = filter.getAccountLockouts().get("user@test.com");
        assertNull(lockout, "Should not be locked after successful login");
    }

    @Test
    void successClearsLockout() {
        for (int i = 0; i < 5; i++) {
            filter.recordLoginFailure("user@test.com");
        }
        assertNotNull(filter.getAccountLockouts().get("user@test.com"));
        filter.recordLoginSuccess("user@test.com");
        assertNull(filter.getAccountLockouts().get("user@test.com"));
    }

    @Test
    void differentEmailsAreIndependent() {
        for (int i = 0; i < 5; i++) {
            filter.recordLoginFailure("user1@test.com");
        }
        assertNotNull(filter.getAccountLockouts().get("user1@test.com"));
        assertNull(filter.getAccountLockouts().get("user2@test.com"));
    }

    @Test
    void emailIsCaseInsensitive() {
        for (int i = 0; i < 5; i++) {
            filter.recordLoginFailure("User@Test.com");
        }
        assertNotNull(filter.getAccountLockouts().get("user@test.com"));
    }
}
