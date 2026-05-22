export type UserRole = "student" | "staff" | "admin";
export type AuthUserType = "student" | "staff";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
  role: UserRole;
  studentId?: string;
  type?: AuthUserType;
};

export type LoginPayload = {
  email: string;
  password: string;
  device_name?: string;
};

export type LoginResponse = {
  token: string;
  tokenType: string;
  user: AuthUser;
  role: UserRole;
};

export type AuthUserDto = {
  id: string | number;
  name: string;
  email: string;
  role?: UserRole | string | { name?: string; slug?: string };
  roles?: (string | { name?: string; slug?: string })[];
  permissions?: string[];
  studentId?: string;
  student_id?: string;
  student_number?: string;
  type?: AuthUserType;
};

export type LoginResponseDto = {
  user: AuthUserDto;
  token: string;
  token_type?: string;
};
