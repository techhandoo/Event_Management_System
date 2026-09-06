package com.eventmanager.validation;

/**
 * Centralized password strength validation.
 * Used by StrongPasswordValidator (registration) and AdminSeedController (admin setup).
 */
public final class PasswordValidator {

    private PasswordValidator() {}

    /**
     * Check if password meets enterprise requirements:
     * - At least 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one digit
     * - At least one special character
     */
    public static boolean isStrong(String password) {
        if (password == null || password.length() < 8 || password.length() > 100) return false;

        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    /**
     * Get a human-readable list of which requirements are not met.
     * Used for error messages.
     */
    public static String describeFailures(String password) {
        if (password == null) return "Password is required";
        if (password.length() < 8) return "Password must be at least 8 characters";
        if (password.length() > 100) return "Password must be at most 100 characters";

        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }

        StringBuilder sb = new StringBuilder("Password must contain ");
        java.util.List<String> missing = new java.util.ArrayList<>();
        if (!hasUpper) missing.add("an uppercase letter");
        if (!hasLower) missing.add("a lowercase letter");
        if (!hasDigit) missing.add("a number");
        if (!hasSpecial) missing.add("a special character");

        return sb.append(String.join(", ", missing)).toString();
    }
}
