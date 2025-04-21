import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthContextProps } from './auth-types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
  }, []);

  const clearToken = useCallback(() => {
    setTokenState(null);
  }, []);

  const value = {
    token,
    setToken,
    clearToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
