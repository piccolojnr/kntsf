import {
  AuthUser,
  UserRole,
} from "@/features/auth/auth-types";

type MockUserRecord = {
  password: string;
  user: AuthUser;
  token: string;
};

const mockUsers: MockUserRecord[] = [
  {
    password: "password",
    token: "mock-student-token",
    user: {
      id: "student-1",
      name: "Ama Boateng",
      email: "student@example.com",
      role: "student",
      studentId: "26102859",
    },
  },
  {
    password: "password",
    token: "mock-staff-token",
    user: {
      id: "staff-1",
      name: "Staff User",
      email: "staff@example.com",
      role: "staff",
    },
  },
  {
    password: "password",
    token: "mock-admin-token",
    user: {
      id: "admin-1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    },
  },
];

const tokenToUser = new Map(
  mockUsers.map((record) => [record.token, record.user] as const),
);

export function simulateDelay(duration = 300) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export async function mockLogout() {
  await simulateDelay(150);
}

export async function mockGetCurrentUser(token: string) {
  await simulateDelay(150);

  const user = tokenToUser.get(token);

  if (!user) {
    return null;
  }

  return { ...user };
}

export async function mockGetRole(token: string): Promise<UserRole | null> {
  const user = await mockGetCurrentUser(token);
  return user?.role ?? null;
}
