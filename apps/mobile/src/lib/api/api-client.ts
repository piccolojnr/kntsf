import { create } from "axios";

import { API_BASE_URL } from "@/constants/config";
import { toUserFacingError } from "@/lib/api/api-errors";
import { getStoredToken, removeStoredToken } from "@/lib/storage/secure-storage";

export const apiClient = create({
  baseURL: API_BASE_URL || undefined,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", error);
    if (error?.response?.status === 401) {
      await removeStoredToken();
    }

    return Promise.reject(toUserFacingError(error));
  },
);
