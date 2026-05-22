import { AuthUser, UserRole } from "@/features/auth/auth-types";

type MaybeUser = AuthUser | null | undefined;

function getRoles(user: MaybeUser) {
  if (!user) {
    return [];
  }

  return user.roles.length > 0 ? user.roles : [user.role];
}

export function hasRole(user: MaybeUser, role: UserRole) {
  return getRoles(user).includes(role);
}

export function hasAnyRole(user: MaybeUser, roles: UserRole[]) {
  return roles.some((role) => hasRole(user, role));
}

export function hasPermission(user: MaybeUser, permission: string) {
  return Boolean(user?.permissions.includes(permission));
}

export function hasAnyPermission(user: MaybeUser, permissions: string[]) {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function isStudent(user: MaybeUser) {
  return hasRole(user, "student");
}

export function isStaff(user: MaybeUser) {
  return hasRole(user, "staff");
}

export function isAdmin(user: MaybeUser) {
  return hasRole(user, "admin");
}
