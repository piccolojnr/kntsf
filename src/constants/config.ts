export type AppEnvironment = "development" | "staging" | "production";

type EnvironmentConfig = {
  apiBaseUrl: string;
};

const ENVIRONMENT_CONFIG: Record<AppEnvironment, EnvironmentConfig> = {
  development: {
    apiBaseUrl: "https://dev-api.example.com",
  },
  staging: {
    apiBaseUrl: "https://staging-api.example.com",
  },
  production: {
    apiBaseUrl: "https://api.example.com",
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
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  ENVIRONMENT_CONFIG[APP_ENV].apiBaseUrl;

export const STORAGE_KEYS = {
  authToken: "auth_token",
} as const;
