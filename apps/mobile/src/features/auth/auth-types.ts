export type UserRole = "student" | "staff" | "admin";
export type AuthUserType = "student" | "staff";
export type AuthWorkspace = "student" | "operations";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  type?: AuthUserType;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  role: UserRole;
};

export type AuthUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  type?: AuthUserType;
};

export type LoginResponseDto = {
  user: AuthUserDto;
  token: string;
};
