import { create } from "axios";

import { API_BASE_URL } from "@/constants/config";
import { toUserFacingError } from "@/lib/api/api-error";
import { getStoredToken } from "@/lib/storage/secure-storage";

export const apiClient = create({
  baseURL: API_BASE_URL || undefined,
  timeout: 10000,
  headers: {
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
  (error) => Promise.reject(toUserFacingError(error)),
);
