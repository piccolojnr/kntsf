export type AppEnvironment = "development" | "staging" | "production";

type EnvironmentConfig = {
  apiBaseUrl: string;
};

const ENVIRONMENT_CONFIG: Record<AppEnvironment, EnvironmentConfig> = {
  development: {
    apiBaseUrl: "http://192.168.8.163:3001",
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
  ENVIRONMENT_CONFIG[APP_ENV].apiBaseUrl;
export const USE_MOCK_API =
  process.env.EXPO_PUBLIC_USE_MOCK_API === "true" || !API_BASE_URL;




export const STORAGE_KEYS = {
  authToken: "auth_token",
} as const;
