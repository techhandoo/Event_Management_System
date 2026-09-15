/**
 * Mirrors the backend StrongPasswordValidator so register/reset forms give
 * instant feedback without a server round-trip. Keep in sync with
 * backend/.../validation/StrongPasswordValidator.java.
 */
export function passwordRules(v: string): string | true {
 if (!v) return 'Password is required';
 if (v.length < 8) return 'At least 8 characters';
 if (!/[A-Z]/.test(v)) return 'Must include an uppercase letter';
 if (!/[a-z]/.test(v)) return 'Must include a lowercase letter';
 if (!/[0-9]/.test(v)) return 'Must include a number';
 if (!/[^A-Za-z0-9]/.test(v)) return 'Must include a special character (!@#$ etc.)';
 return true;
}
