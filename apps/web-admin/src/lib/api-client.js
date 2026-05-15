"use client";

import axios from "axios";
import { useAdminStore } from "@/store/admin-store";

export const ADMIN_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const adminApi = axios.create({
  baseURL: ADMIN_API_BASE,
  timeout: 30000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

const refreshApi = axios.create({
  baseURL: ADMIN_API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

let refreshPromise = null;

adminApi.interceptors.request.use((config) => {
  const token = useAdminStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["x-client-platform"] = "web-admin";
  return config;
});

adminApi.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const { refreshToken, setTokens, logout } = useAdminStore.getState();

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ??
          refreshApi
            .post("/auth/refresh", refreshToken ? { refreshToken } : {})
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
        return adminApi(original);
      } catch (refreshError) {
        logout();
        throw normalizeAdminError(refreshError);
      }
    }

    throw normalizeAdminError(error);
  },
);

export async function adminRequest(path, options = {}) {
  return adminApi.request({
    url: path,
    method: options.method ?? "GET",
    params: options.params,
    data: options.body,
    headers: options.headers,
    signal: options.signal,
  });
}

export function normalizeAdminError(error) {
  const payload = error.response?.data;
  const message = payload?.message ?? error.message ?? "Request failed";
  const normalized = new Error(Array.isArray(message) ? message.join(", ") : message);
  normalized.status = error.response?.status;
  normalized.code = payload?.code ?? payload?.error;
  normalized.details = payload;
  normalized.isNetworkError = !error.response;
  return normalized;
}
