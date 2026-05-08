import { USE_MOCK_API } from "@/constants/config";
import { mockGetCurrentUser, mockLogout } from "@/lib/api/mock-api";
import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-error";
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

type MobileAuthResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type BackendMeData = {
  user?: AuthUserDto;
} & Partial<AuthUserDto>;

function normalizeAuthUser(dto: AuthUserDto | null | undefined) {
  if (!dto) {
    return null;
  }

  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    role: dto.role,
    studentId: dto.studentId,
    type: dto.type ?? (dto.role === "student" ? "student" : "staff"),
  };
}

function normalizeLoginResponse(dto: LoginResponseDto): LoginResponse {
  const user = normalizeAuthUser(dto.user);

  if (!user) {
    throw new Error("Login response did not include a user.");
  }

  return {
    token: dto.token,
    user,
    role: user.role,
  };
}

function normalizeMeResponse(data: BackendMeData) {
  return normalizeAuthUser(data.user ?? (data as AuthUserDto));
}

export async function login(payload: LoginPayload) {
  try {
    const response = normalizeLoginResponse(
      (
        await apiClient.post<MobileAuthResponse<LoginResponseDto>>(
          "/api/mobile/auth/login",
          payload,
        )
      ).data.data,
    );

    await setStoredToken(response.token);
    return response;
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function logout() {
  try {
    if (USE_MOCK_API) {
      await mockLogout();
    } else {
      await apiClient.post("/api/mobile/auth/logout");
    }
  } catch {
    // Logout must still clear local auth state if the server is unavailable.
  } finally {
    await removeStoredToken();
  }
}

export async function getCurrentUser() {
  const token = await getStoredToken();

  if (!token) {
    return null;
  }

  try {
    if (USE_MOCK_API) {
      return normalizeAuthUser(await mockGetCurrentUser(token));
    }

    const response =
      await apiClient.get<MobileAuthResponse<BackendMeData>>("/api/mobile/me");

    return normalizeMeResponse(response.data.data);
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.statusCode === 401) {
      await removeStoredToken();
      return null;
    }

    throw new Error(normalizedError.message);
  }
}
