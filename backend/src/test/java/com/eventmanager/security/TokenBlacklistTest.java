package com.eventmanager.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenBlacklistTest {

    private TokenBlacklist blacklist;

    @BeforeEach
    void setUp() {
        blacklist = new TokenBlacklist();
    }

    @Test
    void nonRevokedTokenIsNotRevoked() {
        assertFalse(blacklist.isRevoked("some-token-123"));
    }

    @Test
    void revokedTokenIsRevoked() {
        blacklist.revoke("token-abc");
        assertTrue(blacklist.isRevoked("token-abc"));
    }

    @Test
    void differentTokensAreIndependent() {
        blacklist.revoke("token-1");
        assertTrue(blacklist.isRevoked("token-1"));
        assertFalse(blacklist.isRevoked("token-2"));
    }

    @Test
    void revokeIsIdempotent() {
        blacklist.revoke("token-x");
        blacklist.revoke("token-x");
        assertTrue(blacklist.isRevoked("token-x"));
    }
}
