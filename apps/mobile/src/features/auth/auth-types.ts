export type UserRole = "student" | "staff" | "admin";
export type AuthWorkspace = "student" | "operations";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  role: UserRole;
};

export type AuthUserDto = AuthUser;
export type LoginResponseDto = LoginResponse;
