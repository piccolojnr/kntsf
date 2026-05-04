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
import { getStoredToken } from "@/lib/storage/secure-storage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
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

  const refreshUser = useCallback(async () => {
    const storedToken = await getStoredToken();

    if (!storedToken) {
      setToken(null);
      setUser(null);
      return null;
    }

    const currentUser = await getCurrentAuthUser();

    setToken(storedToken);
    setUser(currentUser);

    if (!currentUser) {
      setToken(null);
    }

    return currentUser;
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);

    setToken(response.token);
    setUser(response.user);

    return response;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const storedToken = await getStoredToken();
        const currentUser = await getCurrentAuthUser();

        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setUser(currentUser);
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
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      refreshUser,
    }),
    [isLoading, login, refreshUser, token, user, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
