'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session from cookie on mount
  useEffect(() => {
    const savedToken = getCookie('nexa-token');
    if (savedToken) {
      setToken(savedToken);
      try {
        // Decode base64 JWT payload safely
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        if (payload && payload.exp * 1000 > Date.now()) {
          setUser({
            id_usuario: payload.id_usuario,
            nombre: payload.nombre,
            email: payload.email,
            id_rol: payload.id_rol,
            is_enabled: payload.is_enabled
          });
        }
      } catch (e) {
        console.error('Failed to parse JWT cookie:', e);
      }
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
        setToken(data.token);
        document.cookie = `nexa-token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        return { success: true, user: data.user, has_pin: data.has_pin };
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
        document.cookie = `nexa-token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
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
    document.cookie = 'nexa-token=; path=/; max-age=0; SameSite=Lax';
  }, []);

  // Expose fetch wrapper that auto-injects bearer token for backend requests
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const activeToken = token || getCookie('nexa-token');
    const headers = {
      ...options.headers,
    };
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
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
