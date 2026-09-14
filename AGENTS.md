# AGENTS.md — Eventry (Event Management System)

## Architecture & deployment
- Frontend (React/Vite) deploys to Vercel, backend (Spring Boot) to Render. They are **cross-origin**, so auth/CSRF cookies must be `SameSite=None; Secure`. API base is `https://eventry-api.onrender.com` (hardcoded in `frontend/src/services/api.ts` and backend CORS).
- Render free tier **sleeps**; requests during cold start show `ERR_NAME_NOT_RESOLVED` / connection 000. Uptime bot must keep it warm; first request after sleep can take 30–60s.
- CI/CD (`.github/workflows/ci-cd.yml`) runs on **JDK 17** with pinned Spring Boot BOM versions.
- Latency complaints ("login takes >1 min") were **Render free-tier sleep** — warm API answers health in ~0.25s and register in ~1s (probed live). UptimeRobot pings `/api/uptime` every 5 min to prevent sleep; a client-side one-shot `warmApi()` in `services/api.ts` covers the missed-ping/deploy case. Don't reintroduce the 120s axios timeout — 20s hard cap + one silent read-only retry is deliberate.

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
- Razorpay refuses order amounts **below ₹1 (100 paise)** — `EventService` blocks paid events under 100 `priceCents` at create/update, and `PaymentService` returns an honest 400 (not "gateway error") for legacy sub-₹1 events. Free (0) is allowed.

## Test conventions
- `CsrfCookiePatternTest` exercises the CSRF filter chain directly (no Spring context/DB/Mockito) — it is the regression lock for the SPA double-submit contract (cookie-read header passes, missing header → 403, repository never writes its own cookie). Keep it in sync with `SecurityConfig.filterChain()`.
- Mockito strictness is on (`UnnecessaryStubbingException` fails builds) — stub only what each test uses.

## Frontend error handling (keep centralized)
- `getApiErrorMessage(err, fallback)` in `services/api.ts` is the single backend-error-envelope extractor — pages must use it, never hand-roll `err.response?.data?.message || 'Failed'` (raw "Failed" toasts are the enterprise-UX regression we removed).
- `ErrorBoundary` deliberately does `window.location.replace('/')` on stale-chunk errors ("Failed to fetch dynamically imported module") after deploys — old lazy chunks 404 once a new bundle ships; don't "fix" the redirect.
- Page roots on auth screens are `h-dvh overflow-hidden` (not `min-h-screen`) — `min-h-screen` let content exceed the viewport and pushed forms below the fold (register-page scroll bug).
- Notification polls abort via `AbortController` — the response interceptor rejects `axios.isCancel` quietly (no retry/toast). `RequestTimingFilter` logs `[SLOW]` WARN lines per request; that's the tool for any future latency report.

## Performance (as of the perf pass)
- Caching has ONE owner: `CacheConfig` (Caffeine fallback when Redis absent — current prod — Composite Redis→Caffeine when present). `@Cacheable`/`@CacheEvict` were silent no-ops before this; don't create a second CacheManager bean.
- `bookingRepository` list queries need `@EntityGraph(attributePaths = {"event"})` — the response mapper reads `event.title/venue` per row (N+1 without it).
- Vite `manualChunks` (vendor/motion/charts) + page-level `React.lazy` are in place; `vite build` currently outputs ~640 kB across 5 JS chunks — the vendor chunk is dominated by recharts and only shrinks by lazy-loading dashboard chart components.
- Frontend tests: `npm test` (vitest, jsdom) covers `api.ts` retry/error logic; `src/services/api.test.ts` spies on the exported axios *instance* (`api.post`), not `axios.post`.
- `frontend/src/config.ts` is the single owner of the API base URL (`VITE_API_URL` env → prod fallback). Never hardcode `eventry-api.onrender.com` in components/services; `index.html` preconnect is static and must be updated separately.
- `npm run lint` works now (ESLint 9 flat config in `frontend/eslint.config.js`). `no-undef` is deliberately off for TS files — tsc owns that check and no-undef false-positives on type-position globals like `React.FormEvent`. Hook-deps warnings fail the build (`--max-warnings 0`) — wrap loaders in `useCallback([page])`, don't disable the rule.