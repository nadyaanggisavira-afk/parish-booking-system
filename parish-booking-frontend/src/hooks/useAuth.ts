import { useCallback, useState } from 'react';
import {
  api,
  clearSession,
  getStoredUser,
  storeSession,
  type AuthUser,
} from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await api.login(email, password);
    storeSession(accessToken, user);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(
    async (data: {
      nama: string;
      email: string;
      noWhatsapp: string;
      lingkungan: string;
      password: string;
    }) => {
      const { accessToken, user } = await api.register(data);
      storeSession(accessToken, user);
      setUser(user);
      return user;
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };
}
