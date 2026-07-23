'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('nexa-user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexa-token') || null;
    }
    return null;
  });

  const [loading] = useState(false);

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
        setToken(data.token);
        localStorage.setItem('nexa-user', JSON.stringify(data.user));
        localStorage.setItem('nexa-token', data.token);
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
        setToken(data.token);
        localStorage.setItem('nexa-user', JSON.stringify(data.user));
        localStorage.setItem('nexa-token', data.token);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Error al registrar usuario' };
    } catch (e) {
      return { success: false, error: 'Error de red. Inténtalo nuevamente.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexa-user');
    localStorage.removeItem('nexa-token');
  }, []);

  // Expose fetch wrapper that auto-injects bearer token for backend requests
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const savedToken = localStorage.getItem('nexa-token') || token;
    const headers = {
      ...options.headers,
    };
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }
    return fetch(url, { ...options, headers });
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchWithAuth }}>
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


