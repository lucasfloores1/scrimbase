
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/shared/api/auth.api";
import { tokenStorage } from "@/shared/lib/storage";
import type { AuthUser } from "@/shared/types/models";
import { env } from "@/shared/config/env";

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthed: boolean;
  hasTeam: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasTeam = !!user?.teamMember?.teamId;

  async function bootstrap() {
    if (!tokenStorage.getAccess()) {
      // DEV bypass
      if (env.DEV_BYPASS_AUTH) {
        setUser({
          userId: "dev-user",
          email: "dev@scrimbase.gg",
          teamMember: {
            id: "dev-tm",
            userId: "dev-user",
            teamId: "dev-team",
            role: "PLAYER",
            isAdmin: true,
            joinedAt: new Date().toISOString(),
          },
        });
        setIsLoading(false);
        return;
      }

      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const tokens = await authApi.login({ email, password });

    tokenStorage.setAccess(tokens.accessToken);
    tokenStorage.setRefresh(tokens.refreshToken);

    const me = await authApi.me();
    setUser(me);
    return me;
  }

  function logout() {
    tokenStorage.clear();
    setUser(null);
  }

  useEffect(() => {
    bootstrap();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthed: !!user,
      hasTeam,
      bootstrap,
      login,
      logout,
    }),
    [user, isLoading, hasTeam]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}