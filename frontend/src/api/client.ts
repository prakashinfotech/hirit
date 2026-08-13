import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

const TOKEN_KEY = 'hirit_access_token';
const REFRESH_KEY = 'hirit_refresh_token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccess: (): string | null => localStorage.getItem(TOKEN_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  setAccess: (access: string): void => {
    localStorage.setItem(TOKEN_KEY, access);
  },
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => {
    // Normalize paginated responses
    const data = response.data;
    if (data && typeof data === 'object' && 'total' in data && !('count' in data)) {
      response.data = {
        ...data,
        count: data.total,
        results: data.data || data.results || [],
        total_pages: data.total_pages || 1,
        current_page: data.page || 1,
      };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept 401s from the auth endpoints themselves — let the UI handle them
      const url = originalRequest.url ?? '';
      if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) {
        throw buildApiError(error);
      }

      const refreshToken = tokenStorage.getRefresh();

      // No refresh token available — clear session and redirect
      if (!refreshToken) {
        tokenStorage.clear();
        window.location.href = '/login';
        throw buildApiError(error);
      }

      if (isRefreshing) {
        // Queue concurrent requests until token is refreshed
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => { throw err; });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ access: string }>(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/auth/token/refresh/`,
          { refresh: refreshToken },
        );
        tokenStorage.setAccess(data.access);
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw buildApiError(error);
  },
);

export class CustomApiError extends Error implements ApiError {
  detail?: string;
  errors?: Record<string, string[]>;
  status_code?: number;

  constructor(message: string, detail?: string, errors?: Record<string, string[]>, status_code?: number) {
    super(message);
    this.name = 'CustomApiError';
    this.detail = detail;
    this.errors = errors;
    this.status_code = status_code;
    Object.setPrototypeOf(this, CustomApiError.prototype);
  }
}

function buildApiError(error: AxiosError): CustomApiError {
  const data = error.response?.data as Record<string, unknown> | undefined;
  const message =
    (data?.detail as string) ??
    (data?.message as string) ??
    error.message ??
    'An unexpected error occurred';
  return new CustomApiError(
    message,
    data?.detail as string | undefined,
    data?.errors as Record<string, string[]> | undefined,
    error.response?.status
  );
}

export default apiClient;
