# AGENTS.md — Eventry (Event Management System)

## Architecture & deployment
- Frontend (React/Vite) deploys to Vercel, backend (Spring Boot) to Render. They are **cross-origin**, so auth/CSRF cookies must be `SameSite=None; Secure`. API base is `https://eventry-api.onrender.com` (hardcoded in `frontend/src/services/api.ts` and backend CORS).
- Render free tier **sleeps**; requests during cold start show `ERR_NAME_NOT_RESOLVED` / connection 000. Uptime bot must keep it warm; first request after sleep can take 30–60s.
- CI/CD (`.github/workflows/ci-cd.yml`) runs on **JDK 17** with pinned Spring Boot BOM versions.

## Security setup (do not "simplify")
- Self-registration via the signup page is **intended** to allow ATTENDEE **and ORGANIZER** roles (`RegisterPage.tsx` has a role selector; `AuthContext.register` sends `role`). The only hard rule: **ADMIN must never be self-assignable** — `AuthService.registerWithTokens` whitelists ATTENDEE|ORGANIZER and downgrades everything else to ATTENDEE. Do NOT remove the `role` field from `RegisterRequest` to "fix" escalation; that silently breaks organizer signup.
- `SecurityConfig` must pin `CsrfTokenRequestAttributeHandler` (raw, non-Xor). Spring Security 6.2's default `XorCsrfTokenRequestAttributeHandler` masks the token in the `_csrf` attribute, so any filter copying that attribute into a cookie produces a masked cookie that never matches the repository's raw comparison → every POST/PUT/DELETE 403s.
- `CookieCsrfTokenRepository` is **final** in Spring Security 6.2 — cannot be subclassed. The single-writer CSRF repository (`SecurityConfig.nonWritingCsrfTokenRepository`) delegates via the `CsrfTokenRepository` interface; `CsrfTokenCookieFilter` (inner class, values passed via constructor — `@Value` does not inject into `new`-ed classes) is the sole XSRF-TOKEN cookie writer with `SameSite=None`.
- Security `@Component` filters (`JwtAuthenticationFilter`, `RateLimitFilter`, `AccountLockoutFilter`) must each have an **individual** `FilterRegistrationBean` bean with `setEnabled(false)`. Spring Boot silently ignores `FilterRegistrationBean[]`/list beans; if filters auto-register globally, auth breaks with a universal 401 (global run authenticates, then the chain's `OncePerRequestFilter` copy is skipped). `SecurityHeaderFilter` is intentionally global.

## Local dev (Windows, JDK 24)
- Backend compile/test on this machine requires version overrides that must **never** be committed to the pom (CI's JDK 17 + pinned BOM works without them):
  `./mvnw test -Dlombok.version=1.18.38 -Dmockito.version=5.14.2 -Dbyte-buddy.version=1.15.11`
- `EventBookingIntegrationTest` is `@Disabled` (needs Docker Testcontainers: postgres:16-alpine + confluentinc/cp-kafka:7.5.0).
- Frontend: `cd frontend && npx tsc --noEmit` for typecheck, `npx vite build` for prod build.

## Test conventions
- `CsrfCookiePatternTest` exercises the CSRF filter chain directly (no Spring context/DB/Mockito) — it is the regression lock for the SPA double-submit contract (cookie-read header passes, missing header → 403, repository never writes its own cookie). Keep it in sync with `SecurityConfig.filterChain()`.
- Mockito strictness is on (`UnnecessaryStubbingException` fails builds) — stub only what each test uses.