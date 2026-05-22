export type AppEnvironment = "development" | "preview" | "production";

type EnvironmentConfig = {
  apiBaseUrl: string;
};

const ENVIRONMENT_CONFIG: Record<AppEnvironment, EnvironmentConfig> = {
  development: {
    // apiBaseUrl: "http://192.168.100.249:3001",
    apiBaseUrl: "https://a487-154-161-184-123.ngrok-free.app",
  },
  preview: {
    apiBaseUrl: "https://admin.knutsfordsrc.com",
  },
  production: {
    apiBaseUrl: "https://admin.knutsfordsrc.com",
  },
};

function getAppEnvironment(): AppEnvironment {
  const value = process.env.EXPO_PUBLIC_APP_ENV;

  if (value === "development" || value === "preview" || value === "production") {
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
