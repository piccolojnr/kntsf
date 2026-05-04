import { mockGetCurrentUser, mockLogin, mockLogout } from "@/lib/api/mock-api";
import {
  getStoredToken,
  removeStoredToken,
  setStoredToken,
} from "@/lib/storage/secure-storage";

import { LoginPayload } from "./auth-types";

export async function login(payload: LoginPayload) {
  const response = await mockLogin(payload);
  await setStoredToken(response.token);
  return response;
}

export async function logout() {
  await mockLogout();
  await removeStoredToken();
}

export async function getCurrentUser() {
  const token = await getStoredToken();

  if (!token) {
    return null;
  }

  return mockGetCurrentUser(token);
}
