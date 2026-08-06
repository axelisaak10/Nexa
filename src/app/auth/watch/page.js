'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// Inner component that uses useSearchParams (must be inside Suspense)
function WatchPairingInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { user, login } = useAuth();
  const { showToast } = useToast();

  // States: 'loading' | 'confirming' | 'success' | 'expired' | 'login' | 'logging-in'
  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const confirmToken = async (userId) => {
    try {
      const res = await fetch('/api/watch/qr-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId: userId || 'guest' }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('nexa-watch-token', token);
        setStatus('success');
        showToast('¡Smartwatch vinculado exitosamente! ⌚', 'success');
        setTimeout(() => router.push('/'), 2500);
      } else {
        setStatus('expired');
      }
    } catch {
      setStatus('expired');
    }
  };

  useEffect(() => {
    // Si no hay token en la URL, expira directamente
    if (!token) {
      setStatus('expired');
      return;
    }

    // Comprobar si hay un usuario guardado en localStorage directamente por resguardo
    let currentUser = user;
    if (!currentUser && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nexa-user');
        if (saved) currentUser = JSON.parse(saved);
      } catch (_) {}
    }

    const timer = setTimeout(() => {
      if (currentUser) {
        setStatus('confirming');
        confirmToken(currentUser.id_usuario);
      } else {
        setStatus('login');
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const handleLoginAndPair = async (e) => {
    e.preventDefault();
    setLoginError('');
    setStatus('logging-in');
    const result = await login(email, password);
    if (result.success) {
      await confirmToken(result.user?.id_usuario);
    } else {
      setLoginError(result.error || 'Correo o contraseña incorrectos.');
      setStatus('login');
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setStatus('logging-in');
    const result = await login(demoEmail, demoPass);
    if (result.success) {
      await confirmToken(result.user?.id_usuario);
    } else {
      setLoginError(result.error || 'Error al iniciar sesión demo.');
      setStatus('login');
    }
  };

  return (
    <div className="auth-page" id="watch-pairing-page">
      <div className="auth-card watch-pairing-card">

        <div className="auth-header">
          <div className="watch-pairing-icon">⌚</div>
          <h1 className="auth-title">
            {status === 'success' ? 'Reloj Vinculado' :
             status === 'expired' ? 'Código Expirado' :
             'Vincular Smartwatch'}
          </h1>
          {token && status !== 'expired' && status !== 'success' && (
            <p className="watch-token-badge">
              Código: <strong>{token}</strong>
            </p>
          )}
        </div>

        {(status === 'loading' || status === 'confirming') && (
          <div className="watch-pairing-status">
            <div className="watch-pairing-spinner" />
            <p className="watch-pairing-msg">
              {status === 'confirming' ? 'Confirmando emparejamiento...' : 'Verificando código...'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="watch-pairing-status">
            <div className="watch-pairing-check">✓</div>
            <p className="watch-pairing-msg success">
              Tu smartwatch ya está conectado.<br />
              Redirigiendo a la tienda…
            </p>
            <Link href="/" className="auth-btn" style={{ marginTop: '1rem', textAlign: 'center', display: 'block' }}>
              IR A LA TIENDA
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="watch-pairing-status">
            <div className="watch-pairing-error-icon">⏱</div>
            <p className="watch-pairing-msg error">
              {token
                ? 'El código QR ha expirado o ya fue usado.'
                : 'No se encontró un código QR válido en este enlace.'}
              <br />Abre la app en el reloj para generar uno nuevo.
            </p>
            <Link href="/auth/login" className="auth-btn" style={{ marginTop: '1rem', textAlign: 'center', display: 'block' }}>
              VOLVER AL LOGIN
            </Link>
          </div>
        )}

        {(status === 'login' || status === 'logging-in') && (
          <>
            <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              Inicia sesión para vincular tu reloj automáticamente
            </p>

            {loginError && (
              <div className="auth-error-banner" id="watch-login-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginAndPair} className="auth-form">
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="watch-pair-email">Correo Electrónico</label>
                <input
                  className="auth-input"
                  type="email"
                  id="watch-pair-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@ejemplo.com"
                  disabled={status === 'logging-in'}
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="watch-pair-password">Contraseña</label>
                <input
                  className="auth-input"
                  type="password"
                  id="watch-pair-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={status === 'logging-in'}
                />
              </div>
              <button
                type="submit"
                className="auth-btn"
                id="watch-pair-submit"
                disabled={status === 'logging-in'}
              >
                {status === 'logging-in' ? 'VINCULANDO...' : '⌚ INICIAR SESIÓN Y VINCULAR'}
              </button>
            </form>

            <div className="auth-divider"><span>O PRUEBA CON UNA CUENTA DEMO</span></div>

            <div className="auth-demo-grid">
              <button type="button" onClick={() => handleDemoLogin('admin@nexa.com', 'admin123')} className="demo-chip-btn" disabled={status === 'logging-in'} id="watch-pair-demo-admin">
                <span className="demo-chip-role">ADMINISTRADOR</span>
                <span className="demo-chip-email">admin@nexa.com</span>
              </button>
              <button type="button" onClick={() => handleDemoLogin('demo@nexa.com', 'demo123')} className="demo-chip-btn" disabled={status === 'logging-in'} id="watch-pair-demo-client">
                <span className="demo-chip-role">CLIENTE DEMO</span>
                <span className="demo-chip-email">demo@nexa.com</span>
              </button>
            </div>

            <p className="auth-footer-text">
              ¿No tienes una cuenta?{' '}
              <Link href="/auth/register" className="auth-link">Regístrate aquí</Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

// Suspense wrapper required by Next.js for useSearchParams()
export default function WatchPairingPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card watch-pairing-card">
          <div className="auth-header">
            <div className="watch-pairing-icon">⌚</div>
            <h1 className="auth-title">Vincular Smartwatch</h1>
          </div>
          <div className="watch-pairing-status">
            <div className="watch-pairing-spinner" />
            <p className="watch-pairing-msg">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <WatchPairingInner />
    </Suspense>
  );
}
