package com.eventmanager.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Logs security-relevant events for audit trail.
 * In production, this would write to a dedicated audit log or SIEM.
 */
@Component
public class AuditLogger {

    private static final Logger auditLog = LoggerFactory.getLogger("SECURITY_AUDIT");

    public void logLogin(String email, String ip, boolean success) {
        auditLog.info("LOGIN {} email={} ip={}", success ? "SUCCESS" : "FAILURE", email, maskIp(ip));
    }

    public void logRegister(String email, String ip) {
        auditLog.info("REGISTER email={} ip={}", email, maskIp(ip));
    }

    public void logLogout(String email) {
        auditLog.info("LOGOUT email={}", email);
    }

    public void logTokenRefresh(String email, boolean success) {
        auditLog.info("TOKEN_REFRESH {} email={}", success ? "SUCCESS" : "FAILURE", email);
    }

    public void logPasswordReset(String email, boolean success) {
        auditLog.info("PASSWORD_RESET {} email={}", success ? "SUCCESS" : "FAILURE", email);
    }

    public void logRoleChange(String adminEmail, String targetEmail, String newRole) {
        auditLog.info("ROLE_CHANGE admin={} target={} role={}", adminEmail, targetEmail, newRole);
    }

    public void logAccountLockout(String email, String ip) {
        auditLog.warn("ACCOUNT_LOCKOUT email={} ip={}", email, maskIp(ip));
    }

    public void logRateLimit(String ip, String endpoint) {
        auditLog.warn("RATE_LIMIT ip={} endpoint={}", maskIp(ip), endpoint);
    }

    /**
     * Mask IP for privacy: 192.168.1.xxx
     */
    private String maskIp(String ip) {
        if (ip == null) return "unknown";
        int lastDot = ip.lastIndexOf('.');
        if (lastDot < 0) return ip;
        return ip.substring(0, lastDot) + ".xxx";
    }
}
