import axios from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "../store/authStore";

const DEFAULT_API_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${DEFAULT_API_HOST}:3001/api/v1`;

const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { Accept: "application/json" },
});

const refreshApi = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers["x-client-platform"] = "mobile";
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    if (status === 401 && refreshToken && original && !original._retry) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ??
          refreshApi
            .post("/auth/refresh", { refreshToken })
            .then((response) => {
              const tokens = response.data;
              setTokens(tokens.accessToken, tokens.refreshToken);
              return tokens.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });

        const nextAccessToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${nextAccessToken}`;
        return api(original);
      } catch (refreshError) {
        logout();
        throw normalizeApiError(refreshError);
      }
    }

    throw normalizeApiError(error);
  },
);

export async function apiRequest(path, options = {}) {
  const config = {
    url: path,
    method: options.method ?? "GET",
    params: options.params,
    data: options.body,
    headers: options.headers,
    signal: options.signal,
  };

  return requestWithRetry(config, options.retry);
}

export async function requestWithRetry(config, retry = {}) {
  const attempts = retry.attempts ?? 2;
  const delayMs = retry.delayMs ?? 400;
  let lastError;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      return await api.request(config);
    } catch (error) {
      lastError = error;
      const status = error.status;
      const canRetry = RETRYABLE_STATUS.has(status) && attempt < attempts;
      if (!canRetry || !isIdempotent(config.method)) {
        throw error;
      }
      await delay(delayMs * 2 ** attempt);
    }
  }

  throw lastError;
}

export function normalizeApiError(error) {
  const payload = error.response?.data;
  const message = payload?.message ?? error.message ?? "Request failed";
  const normalized = new Error(
    Array.isArray(message) ? message.join(", ") : message,
  );
  normalized.status = error.response?.status;
  normalized.code = payload?.code ?? payload?.error;
  normalized.details = payload;
  normalized.isNetworkError = !error.response;
  return normalized;
}

function isIdempotent(method = "GET") {
  return ["GET", "HEAD", "OPTIONS"].includes(String(method).toUpperCase());
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function apiRole(role) {
  const map = {
    Doctor: "DOCTOR",
    Nurse: "NURSE",
    Patient: "PATIENT",
    Admin: "ADMIN",
  };
  return map[role] ?? role;
}

export function appRole(role) {
  const map = {
    DOCTOR: "Doctor",
    NURSE: "Nurse",
    PATIENT: "Patient",
    ADMIN: "Admin",
  };
  return map[role] ?? role;
}
