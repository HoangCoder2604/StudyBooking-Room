import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'study-room-auth-token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(TOKEN_KEY);
      if (!saved) return setLoading(false);
      try {
        const data = await apiRequest('/api/me', { token: saved });
        setToken(saved);
        setUser(data.user);
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const acceptSession = async (data) => {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const data = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });
    await acceptSession(data);
  };

  const register = async (values) => {
    const data = await apiRequest('/api/auth/register', { method: 'POST', body: values });
    await acceptSession(data);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (preferences) => {
    const data = await apiRequest('/api/me/preferences', { token, method: 'PATCH', body: preferences });
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(() => ({ token, user, loading, login, register, logout, updatePreferences }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

