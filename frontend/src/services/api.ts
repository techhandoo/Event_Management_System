import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://eventry-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 min for cold starts
  withCredentials: true, // Send cookies cross-origin
});

// Cold-start indicator
let coldStartToastId: string | null = null;
let pendingRequests = 0;

// ─── CSRF token helper ────────────────────────────────
function getCsrfToken(): string | null {
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

    const originalRequest = error.config;

    // On 401: try cookie-based refresh (browser sends refresh_token cookie automatically)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // The refresh_token cookie is sent automatically by the browser
        // Backend reads it from the cookie and sets new access_token + refresh_token cookies
        await axios.post('https://eventry-api.onrender.com/api/auth/refresh', null, {
          withCredentials: true,
        });
        // Retry original request — browser will use the new access_token cookie
        return api(originalRequest);
      } catch {
        // Refresh failed — cookies were cleared by backend, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

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
