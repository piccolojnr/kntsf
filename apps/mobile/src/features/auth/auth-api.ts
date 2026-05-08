import { mockGetCurrentUser, mockLogin, mockLogout } from "@/lib/api/mock-api";
import { toUserFacingError } from "@/lib/api/api-error";
import {
  getStoredToken,
  removeStoredToken,
  setStoredToken,
} from "@/lib/storage/secure-storage";

import {
  AuthUserDto,
  LoginPayload,
  LoginResponse,
  LoginResponseDto,
} from "./auth-types";

function normalizeLoginResponse(dto: LoginResponseDto): LoginResponse {
  return {
    token: dto.token,
    user: { ...dto.user },
    role: dto.role,
  };
}

function normalizeAuthUser(dto: AuthUserDto | null) {
  return dto ? { ...dto } : null;
}

export async function login(payload: LoginPayload) {
  try {
    // TODO(real-api): replace mockLogin with apiClient.post("/api/mobile/auth/login").
    const response = normalizeLoginResponse(await mockLogin(payload));
    await setStoredToken(response.token);
    return response;
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function logout() {
  try {
    // TODO(real-api): replace mockLogout with backend logout endpoint if required.
    await mockLogout();
    await removeStoredToken();
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getCurrentUser() {
  const token = await getStoredToken();

  if (!token) {
    return null;
  }

  try {
    // TODO(real-api): replace mockGetCurrentUser with apiClient.get("/api/mobile/me").
    return normalizeAuthUser(await mockGetCurrentUser(token));
  } catch (error) {
    throw toUserFacingError(error);
  }
}
