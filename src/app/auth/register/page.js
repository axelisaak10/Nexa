'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(nombre, email, password);
    if (result.success) {
      showToast('¡Cuenta registrada exitosamente en Supabase!', 'success');
      router.push('/');
    } else {
      setError(result.error);
      showToast(result.error || 'Error al registrar usuario', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Únete a Nexa y descubre objetos seleccionados</p>
        </div>

        {error && (
          <div className="auth-error-banner" id="register-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-name">Nombre Completo</label>
            <input
              className="auth-input"
              type="text"
              id="register-name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre completo"
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-email">Correo Electrónico</label>
            <input
              className="auth-input"
              type="email"
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@ejemplo.com"
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-password">Contraseña</label>
            <input
              className="auth-input"
              type="password"
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading} id="register-submit">
            {loading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
          </button>
        </form>

        <p className="auth-footer-text">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className="auth-link">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
