import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { mocksEnabled } from '../../../services/api/mode';
import { onSessionExpired } from '../../../services/api/sessionEvents';
import { secureTokenStore } from '../../../services/storage/secureTokenStore';

export type AuthUser = { name: string; email: string; phone: string };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<void>;
  dismissSessionExpired: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Session state. Mock mode keeps it in memory; live mode restores it from the
// stored bearer token (authService stores the token on login/signup).
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [sessionExpired, setSessionExpired] = useState(false);

  // Live: restore the session silently on launch (GET /api/auth/me). Failure
  // (no token, expired, offline) falls back to guest.
  useEffect(() => {
    if (mocksEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        if (!(await secureTokenStore.getToken())) return;
        const { user: me } = await apiClient.get<{
          user: { username: string; email: string; phone: string };
        }>(endpoints.auth.me);
        if (!cancelled)
          setUser({ name: me.username, email: me.email, phone: me.phone });
      } catch {
        // stay guest
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    if (!mocksEnabled) {
      await apiClient.post(endpoints.auth.logout).catch(() => {});
    }
    await secureTokenStore.clearToken();
    setUser(null);
  }, []);

  // A 401 from the API layer (see services/api/interceptors.ts) ends the
  // session and raises the session-expired UI (SessionExpiredModal).
  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(current => {
          if (current) setSessionExpired(true);
          return null;
        });
        secureTokenStore.clearToken().catch(() => {});
      }),
    [],
  );

  const dismissSessionExpired = useCallback(() => setSessionExpired(false), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      sessionExpired,
      signIn: setUser,
      signOut,
      dismissSessionExpired,
    }),
    [user, sessionExpired, signOut, dismissSessionExpired],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
};
