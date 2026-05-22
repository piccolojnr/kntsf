import { apiClient } from "@/lib/api/api-client";
import { normalizeApiError, toUserFacingError } from "@/lib/api/api-errors";
import { unwrapData } from "@/lib/api/api-response";
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
  UserRole,
} from "./auth-types";

type MobileAuthResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type BackendMeData = {
  user?: AuthUserDto;
} & Partial<AuthUserDto>;

const VALID_ROLES = ["student", "staff", "admin"] as const;

function isUserRole(value: string | undefined): value is (typeof VALID_ROLES)[number] {
  return Boolean(value && VALID_ROLES.includes(value as (typeof VALID_ROLES)[number]));
}

function normalizeRoles(dto: AuthUserDto): UserRole[] {
  const roles = (dto.roles ?? []).filter(isUserRole);

  if (roles.length > 0) {
    return roles;
  }

  if (isUserRole(dto.role)) {
    return [dto.role];
  }

  return ["student"];
}

function getPrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes("admin")) {
    return "admin";
  }

  if (roles.includes("staff")) {
    return "staff";
  }

  return "student";
}

function getDeviceName(payload: LoginPayload) {
  return payload.device_name ?? "Expo Mobile App";
}

function normalizeAuthUser(dto: AuthUserDto | null | undefined) {
  if (!dto) {
    return null;
  }

  const roles = normalizeRoles(dto);
  const role = getPrimaryRole(roles);

  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    roles,
    permissions: dto.permissions ?? [],
    role,
    studentId: dto.studentId ?? dto.student_id ?? dto.student_number,
    type: dto.type ?? (role === "student" ? "student" : "staff"),
  };
}

function normalizeLoginResponse(dto: LoginResponseDto): LoginResponse {
  const user = normalizeAuthUser(dto.user);

  if (!user) {
    throw new Error("Login response did not include a user.");
  }

  return {
    token: dto.token,
    tokenType: dto.token_type ?? "Bearer",
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
      unwrapData<LoginResponseDto>(
        (
          await apiClient.post<LoginResponseDto | MobileAuthResponse<LoginResponseDto>>(
            "/api/mobile/auth/login",
            {
              email: payload.email,
              password: payload.password,
              device_name: getDeviceName(payload),
            },
          )
        ).data,
      ),
    );

    await setStoredToken(response.token);
    return response;
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function logout() {
  try {
    await apiClient.post("/api/mobile/auth/logout");
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
    const response =
      await apiClient.get<BackendMeData | MobileAuthResponse<BackendMeData>>(
        "/api/mobile/me",
      );

    return normalizeMeResponse(unwrapData<BackendMeData>(response.data));
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.status === 401) {
      await removeStoredToken();
      return null;
    }

    throw toUserFacingError(error);
  }
}
