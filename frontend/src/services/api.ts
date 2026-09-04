import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://eventry-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 min for cold starts
});

// Cold-start indicator: show "Waking up" toast if request takes >5s
let coldStartToastId: string | null = null;
let pendingRequests = 0;

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    pendingRequests++;
    if (pendingRequests === 1) {
      coldStartToastId = toast.loading('Waking up server... this may take a moment', { duration: 60000 });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: dismiss cold-start toast + handle 401 and token refresh
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post('https://eventry-api.onrender.com/api/auth/refresh', null, {
            headers: { 'Refresh-Token': refreshToken },
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth endpoints ──────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<unknown, { data: { data: { accessToken: string; refreshToken: string; tokenType: string; expiresIn: number; user: import('../types').User } } }>('/auth/login', data),

  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<unknown, { data: { data: { accessToken: string; refreshToken: string; tokenType: string; expiresIn: number; user: import('../types').User } } }>('/auth/register', data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', null, { headers: { 'Refresh-Token': refreshToken } }),

  forgotPassword: (email: string) =>
    api.post<unknown, { data: { data: { message: string } } }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<unknown, { data: { data: { message: string } } }>('/auth/reset-password', { token, newPassword }),

  validateResetToken: (token: string) =>
    api.get<unknown, { data: { data: { valid: boolean; email: string } } }>(`/auth/validate-reset-token?token=${token}`),
};

export default api;
