'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      const userName = result.user?.nombre || email.split('@')[0];
      showToast(`¡Bienvenido de nuevo, ${userName}!`, 'success');
      router.push('/');
    } else {
      setError(result.error);
      showToast(result.error || 'Error al iniciar sesión', 'error');
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setLoading(true);
    const result = await login(demoEmail, 'demo1234');
    if (result.success) {
      const userName = result.user?.nombre || demoEmail.split('@')[0];
      showToast(`¡Bienvenido de nuevo, ${userName}!`, 'success');
      router.push('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Bienvenido</h1>
          <p className="auth-subtitle">Inicia sesión para acceder a tu cuenta de Nexa</p>
        </div>
        
        {error && (
          <div className="auth-error-banner" id="login-error">
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
            <label className="auth-label" htmlFor="login-email">Correo Electrónico</label>
            <input
              className="auth-input"
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@ejemplo.com"
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="login-password">Contraseña</label>
            <input
              className="auth-input"
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading} id="login-submit">
            {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div className="auth-divider">
          <span>O PRUEBA CON UNA CUENTA DEMO</span>
        </div>

        <div className="auth-demo-grid">
          <button type="button" onClick={() => handleDemoLogin('admin@nexa.com')} className="demo-chip-btn">
            <span className="demo-chip-role">ADMINISTRADOR</span>
            <span className="demo-chip-email">admin@nexa.com</span>
          </button>
          <button type="button" onClick={() => handleDemoLogin('demo@nexa.com')} className="demo-chip-btn">
            <span className="demo-chip-role">CLIENTE DEMO</span>
            <span className="demo-chip-email">demo@nexa.com</span>
          </button>
        </div>

        <p className="auth-footer-text">
          ¿No tienes una cuenta?{' '}
          <Link href="/auth/register" className="auth-link">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
