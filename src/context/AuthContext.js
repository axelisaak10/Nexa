'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('nexa-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user session:', e);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('nexa-user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Error al iniciar sesión' };
    } catch (e) {
      return { success: false, error: 'Error de red. Inténtalo nuevamente.' };
    }
  }, []);

  const register = useCallback(async (nombre, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('nexa-user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Error al registrar usuario' };
    } catch (e) {
      return { success: false, error: 'Error de red. Inténtalo nuevamente.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('nexa-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
