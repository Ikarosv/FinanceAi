"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ApiError,
  fetchCurrentUser,
  loginUser,
  refreshAccessToken,
  registerUser,
} from "@/lib/api";
import { AuthTokens, LoginPayload, RegisterPayload, User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  withAuth: <T>(request: (accessToken: string) => Promise<T>) => Promise<T>;
};

const STORAGE_KEY = "finance-ai-session";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredTokens() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistTokens(tokens: AuthTokens | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!tokens) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearSession = useCallback(() => {
    persistTokens(null);
    setTokens(null);
    setUser(null);
  }, []);

  const applySession = useCallback((nextUser: User, nextTokens: AuthTokens) => {
    persistTokens(nextTokens);
    setUser(nextUser);
    setTokens(nextTokens);
  }, []);

  const refreshSession = useCallback(async () => {
    const activeTokens = readStoredTokens();

    if (!activeTokens?.refresh) {
      clearSession();
      return null;
    }

    try {
      const refreshed = await refreshAccessToken(activeTokens.refresh);
      const nextTokens = {
        access: refreshed.access,
        refresh: activeTokens.refresh,
      };

      persistTokens(nextTokens);
      setTokens(nextTokens);
      return nextTokens;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const storedTokens = readStoredTokens();

      if (!storedTokens) {
        if (isMounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const me = await fetchCurrentUser(storedTokens.access);

        if (isMounted) {
          applySession(me, storedTokens);
        }
      } catch (error) {
        const apiError = error instanceof ApiError ? error : null;

        if (apiError?.status === 401) {
          const refreshedTokens = await refreshSession();

          if (refreshedTokens) {
            const me = await fetchCurrentUser(refreshedTokens.access);

            if (isMounted) {
              applySession(me, refreshedTokens);
            }
          }
        } else if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [applySession, clearSession, refreshSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const nextTokens = await loginUser(payload);
      const me = await fetchCurrentUser(nextTokens.access);
      applySession(me, nextTokens);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerUser(payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const withAuth = useCallback<AuthContextValue["withAuth"]>(
    async (request) => {
      const activeTokens = readStoredTokens();

      if (!activeTokens?.access) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      try {
        return await request(activeTokens.access);
      } catch (error) {
        const apiError = error instanceof ApiError ? error : null;

        if (apiError?.status !== 401) {
          throw error;
        }

        const refreshedTokens = await refreshSession();

        if (!refreshedTokens) {
          throw error;
        }

        return request(refreshedTokens.access);
      }
    },
    [refreshSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(user && tokens?.access),
      isBootstrapping,
      login,
      register,
      logout,
      withAuth,
    }),
    [isBootstrapping, login, logout, register, tokens, user, withAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
