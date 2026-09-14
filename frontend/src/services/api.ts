import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://eventry-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 20s hard cap — stalls must fail fast, not hang 2 min
  withCredentials: true, // Send cookies cross-origin
});

// ─── One-shot client keep-alive (only if the platform is cold) ────
// UptimeRobot keeps the API warm normally, so this fires at most once per
// session. If the platform did sleep (missed ping, new deploy), the user's
// very first request would otherwise eat the 60–90s JVM boot inside the
// auth request with only a spinner for feedback. Warms on /api/uptime and
// only shows feedback if the wake actually takes >2s.
let keepAliveDone = false;
async function warmApi(): Promise<void> {
  if (keepAliveDone) return;
  keepAliveDone = true;
  const started = performance.now();
  try {
    await axios.get('https://eventry-api.onrender.com/api/uptime', { timeout: 120000 });
  } catch {
    /* uptime endpoint never blocks the real request — retry logic below handles it */
  }
  if (performance.now() - started > 2000) {
    toast('Waking up the server — this happens once', { icon: '⏳', duration: 5000 });
  }
}
warmApi();

// Cold-start indicator
let coldStartToastId: string | null = null;
let coldStartToastTimer: ReturnType<typeof setTimeout> | null = null;
let pendingRequests = 0;

// ─── Shared refresh promise ────────────────────────────
// Prevents race condition: when multiple requests get 401 simultaneously,
// only ONE refresh runs. Others await the same promise.
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // The refresh_token cookie is sent automatically by the browser
      await axios.post('https://eventry-api.onrender.com/api/auth/refresh', null, {
        withCredentials: true,
      });
      // New access_token + refresh_token cookies are now set by the browser
    } catch (err) {
      // Refresh failed — clear state and redirect to login
      refreshPromise = null;
      window.location.href = '/login';
      throw err;
    }
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// ─── CSRF token helper ────────────────────────────────
let csrfTokenMemory: string | null = null;

function getCsrfToken(): string | null {
  // Cross-origin: read from memory (populated by response interceptor)
  if (csrfTokenMemory) return csrfTokenMemory;

  // Same-origin / local dev fallback: read from cookie
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ─── Request interceptor ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Attach CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
    if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    pendingRequests++;
    // Auth requests manage their own cold-start UX via postWithColdStartRetry,
    // and the toast only appears after a 2s grace so warm requests (which
    // answer in <1s) never flash "waking up" at the user.
    const isAuthFlow = (config.url || '').includes('/auth/');
    if (pendingRequests === 1 && !isAuthFlow) {
      coldStartToastTimer = setTimeout(() => {
        coldStartToastId = toast.loading('Waking up server… this may take a moment', { duration: 60000 });
      }, 2000);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Intercept CSRF token from custom header for cross-origin environments
    if (response.headers && response.headers['xsrf-token']) {
      csrfTokenMemory = response.headers['xsrf-token'];
    }

    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) {
      if (coldStartToastTimer) { clearTimeout(coldStartToastTimer); coldStartToastTimer = null; }
      if (coldStartToastId) { toast.dismiss(coldStartToastId); coldStartToastId = null; }
    }
    return response;
  },
  async (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) {
      if (coldStartToastTimer) { clearTimeout(coldStartToastTimer); coldStartToastTimer = null; }
      if (coldStartToastId) { toast.dismiss(coldStartToastId); coldStartToastId = null; }
    }

    // Aborted polls (tab backgrounded, component unmounted) are not errors —
    // reject quietly with no retry, no toast, no log noise.
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Infra failure on a read request: retry ONCE silently (timeout, network
    // drop, 502/503/504). Browser→Render stalls happen on reused keep-alive
    // connections and during boot; a single fresh-connection retry recovers
    // invisibly. Mutations are never auto-retried here (not idempotent) —
    // auth POSTs use postWithColdStartRetry's budgeted loop instead.
    if (originalRequest && isInfraFailure(error)
        && !(originalRequest as { _timeoutRetry?: boolean })._timeoutRetry) {
      const method = (originalRequest.method || '').toLowerCase();
      const isMutation = method === 'post' || method === 'put' || method === 'delete' || method === 'patch';
      if (!isMutation) {
        (originalRequest as { _timeoutRetry?: boolean })._timeoutRetry = true;
        console.warn(`Request failed on infra error — retrying once: ${originalRequest.url}`);
        return api(originalRequest);
      }
    }

    // On 401: try cookie-based refresh (browser sends refresh_token cookie automatically)
    // Skip refresh for auth endpoints — 401 means bad credentials, not expired token
    const url = originalRequest?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
        || url.includes('/auth/logout') || url.includes('/auth/refresh')
        || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        // Shared promise — only ONE refresh runs even if 5 requests get 401
        await refreshAccessToken();
        // Retry original request — browser will use the new access_token cookie
        return api(originalRequest);
      } catch {
        // refreshAccessToken already redirected to /login
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Error message extraction ──────────────────────────
// Single place that knows the backend error envelope ({success,message})
// and axios network-error shapes. Pages call this instead of hand-rolling
// `err.response?.data?.message || 'Failed'`, so users always get an
// actionable, human message (enterprise standard, no raw 'Failed').
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | string | undefined;
    const raw = typeof data === 'string' ? data : data?.message;
    // Render's proxy serves HTML error pages while the service is down —
    // never surface raw HTML (or oversized payloads) as a user-facing message.
    if (raw && !/<\s*(!doctype|html|body)/i.test(raw) && raw.length <= 300) return raw;
    if (err.response && [502, 503, 504].includes(err.response.status)) {
      return 'The server is restarting or briefly unavailable. Please try again in a few seconds.';
    }
    if (err.code === 'ECONNABORTED') {
      return 'The server took too long to respond — it may be waking up. Please retry in a moment.';
    }
    if (!err.response) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
  }
  return fallback;
}

// ─── Cold-start-aware POST wrapper ────────────────────
// A login/register POST that dies at the 20s timeout while Render is booting
// (~60–90s after a deploy restart) would otherwise make the user click
// "Login" 4–5 times. This wrapper retries ONLY infrastructure failures
// (timeout, network drop, 502/503/504 — same predicate the read-retry uses)
// on fresh connections for up to 2.5 minutes with live progress feedback.
// Real server responses — 401 bad password, 409 email taken, 400 validation —
// return instantly, never retried.
export interface ColdStartRetryOptions {
  /** Total retry budget in ms. Default 150s ≈ full Render boot window. */
  budgetMs?: number;
}

const COLD_START_RETRY_BUDGET_MS = 150000;
const COLD_START_TOAST_GRACE_MS = 2000;
const COLD_START_RETRY_PAUSE_MS = 2000;

export function isInfraFailure(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  if (err.code === 'ECONNABORTED') return true; // client timeout, no response
  if (!err.response) return true;               // network drop
  return err.response.status === 502 || err.response.status === 503 || err.response.status === 504;
}

export async function postWithColdStartRetry<T>(
  url: string,
  body?: unknown,
  opts?: ColdStartRetryOptions
): Promise<{ data: T }> {
  const budgetMs = opts?.budgetMs ?? COLD_START_RETRY_BUDGET_MS;
  const startedAt = Date.now();
  let toastId: string | null = null;
  let lastAnnouncedSec = 0;

  try {
    for (;;) {
      try {
        return await api.post<T>(url, body);
      } catch (err) {
        const waitedMs = Date.now() - startedAt;
        if (!isInfraFailure(err) || waitedMs >= budgetMs) throw err;
        const secs = Math.round(waitedMs / 1000);
        if (!toastId && waitedMs >= COLD_START_TOAST_GRACE_MS) {
          toastId = toast.loading('Waking up the server — this can take up to a minute after a deploy…', { duration: COLD_START_RETRY_BUDGET_MS });
          lastAnnouncedSec = secs;
        } else if (toastId && secs - lastAnnouncedSec >= 5) {
          toast.loading(`Still waking up the server… ${secs}s`, { id: toastId, duration: COLD_START_RETRY_BUDGET_MS });
          lastAnnouncedSec = secs;
        }
        await new Promise((resolve) => setTimeout(resolve, COLD_START_RETRY_PAUSE_MS)); // brief pause → fresh connection
      }
    }
  } finally {
    if (toastId) toast.dismiss(toastId);
  }
}

// ─── Auth endpoints ──────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    postWithColdStartRetry<{ data: import('../types').User }>('/auth/login', data),

  register: (data: { email: string; password: string; fullName: string; role?: string }) =>
    postWithColdStartRetry<{ data: import('../types').User }>('/auth/register', data),

  forgotPassword: (email: string) =>
    postWithColdStartRetry<{ data: { message: string } }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<unknown, { data: { data: { message: string } } }>('/auth/reset-password', { token, newPassword }),

  validateResetToken: (token: string) =>
    api.get<unknown, { data: { data: { valid: boolean; email: string } } }>(`/auth/validate-reset-token?token=${token}`),
};

export default api;
