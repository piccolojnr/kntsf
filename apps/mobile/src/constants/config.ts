export type AppEnvironment = "development" | "staging" | "production";

type EnvironmentConfig = {
  apiBaseUrl: string;
};

const ENVIRONMENT_CONFIG: Record<AppEnvironment, EnvironmentConfig> = {
  development: {
    apiBaseUrl: "",
  },
  staging: {
    apiBaseUrl: "",
  },
  production: {
    apiBaseUrl: "",
  },
};

function getAppEnvironment(): AppEnvironment {
  const value = process.env.EXPO_PUBLIC_APP_ENV;

  if (value === "development" || value === "staging" || value === "production") {
    return value;
  }

  return __DEV__ ? "development" : "production";
}

export const APP_ENV = getAppEnvironment();
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  ENVIRONMENT_CONFIG[APP_ENV].apiBaseUrl;

if (!API_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL is required. Set it to your backend base URL.",
  );
}

export const STORAGE_KEYS = {
  authToken: "auth_token",
} as const;
