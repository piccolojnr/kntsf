import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser as getCurrentAuthUser,
  login as loginRequest,
  logout as logoutRequest,
} from "@/features/auth/auth-api";
import {
  AuthUser,
  LoginPayload,
  LoginResponse,
} from "@/features/auth/auth-types";
import { normalizeApiError } from "@/lib/api/api-errors";
import { getStoredToken } from "@/lib/storage/secure-storage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const storedToken = await getStoredToken();

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setAuthError(null);
      return null;
    }

    try {
      const currentUser = await getCurrentAuthUser();

      setToken(currentUser ? storedToken : null);
      setUser(currentUser);
      setAuthError(null);

      return currentUser;
    } catch (error) {
      const normalizedError = normalizeApiError(error);

      if (normalizedError.status === 401) {
        setToken(null);
        setUser(null);
        setAuthError(null);
        return null;
      }

      setToken(storedToken);
      setUser(null);
      setAuthError(normalizedError.message);
      throw error;
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);

    setToken(response.token);
    setUser(response.user);
    setAuthError(null);

    return response;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const storedToken = await getStoredToken();

        try {
          const currentUser = await getCurrentAuthUser();

          if (!isMounted) {
            return;
          }

          setToken(currentUser ? storedToken : null);
          setUser(currentUser);
          setAuthError(null);
        } catch {
          if (!isMounted) {
            return;
          }

          setToken(storedToken);
          setUser(null);
          setAuthError(
            "Unable to restore your session. Check your connection and try again.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      authError,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      refreshUser,
    }),
    [authError, isLoading, login, refreshUser, token, user, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
