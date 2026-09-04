export type AppEnvironment = "development" | "preview" | "production";

function getAppEnvironment(): AppEnvironment {
  const value = process.env.EXPO_PUBLIC_APP_ENV;

  if (value === "development" || value === "preview" || value === "production") {
    return value;
  }

  return __DEV__ ? "development" : "production";
}

export const APP_ENV = getAppEnvironment();
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

if (!API_BASE_URL) {
  throw new Error(
    `EXPO_PUBLIC_API_BASE_URL is required for the ${APP_ENV} build. Set it to your backend base URL.`,
  );
}

export const STORAGE_KEYS = {
  authToken: "auth_token",
} as const;
