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
    await axios.get('https://eventry-api.onrender.com/api/uptime', { timeout: 45000 });
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
    if (pendingRequests === 1) {
      coldStartToastId = toast.loading('Waking up server... this may take a moment', { duration: 60000 });
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
    if (pendingRequests === 0 && coldStartToastId) {
      toast.dismiss(coldStartToastId);
      coldStartToastId = null;
    }
    return response;
  },
  async (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0 && coldStartToastId) {
      toast.dismiss(coldStartToastId);
      coldStartToastId = null;
    }

    // Aborted polls (tab backgrounded, component unmounted) are not errors —
    // reject quietly with no retry, no toast, no log noise.
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Timeout on a read request: retry ONCE silently. Browser→Render
    // stalls occasionally happen on reused keep-alive connections; a single
    // fresh-connection retry recovers invisibly instead of surfacing an
    // error to the user. Mutations are never auto-retried (not idempotent).
    if (error.code === 'ECONNABORTED' && originalRequest
        && !(originalRequest as { _timeoutRetry?: boolean })._timeoutRetry) {
      const method = (originalRequest.method || '').toLowerCase();
      const isMutation = method === 'post' || method === 'put' || method === 'delete' || method === 'patch';
      if (!isMutation) {
        (originalRequest as { _timeoutRetry?: boolean })._timeoutRetry = true;
        console.warn(`Request timed out — retrying once: ${originalRequest.url}`);
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
    const msg = typeof data === 'string' ? data : data?.message;
    if (msg) return msg;
    if (err.code === 'ECONNABORTED') {
      return 'The server took too long to respond — it may be waking up. Please retry in a moment.';
    }
    if (!err.response) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
  }
  return fallback;
}

// ─── Auth endpoints ──────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<unknown, { data: { data: import('../types').User } }>('/auth/login', data),

  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<unknown, { data: { data: import('../types').User } }>('/auth/register', data),

  forgotPassword: (email: string) =>
    api.post<unknown, { data: { data: { message: string } } }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<unknown, { data: { data: { message: string } } }>('/auth/reset-password', { token, newPassword }),

  validateResetToken: (token: string) =>
    api.get<unknown, { data: { data: { valid: boolean; email: string } } }>(`/auth/validate-reset-token?token=${token}`),
};

export default api;
