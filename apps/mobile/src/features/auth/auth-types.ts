export type UserRole = "student" | "staff" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
