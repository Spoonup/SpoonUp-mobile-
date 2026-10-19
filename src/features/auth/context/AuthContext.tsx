import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onSessionExpired } from '../../../services/api/sessionEvents';
import { secureTokenStore } from '../../../services/storage/secureTokenStore';

export type AuthUser = { name: string; phone: string };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<void>;
  dismissSessionExpired: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// MOCK: in-memory session until the real auth backend issues tokens.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [sessionExpired, setSessionExpired] = useState(false);

  const signOut = useCallback(async () => {
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
