'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import PinPad from '@/components/PinPad';

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1 = credenciales, 2 = PIN
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState(null); // usuario tras paso 1

  // Watch QR login state
  const [watchCode, setWatchCode] = useState('');
  const [watchError, setWatchError] = useState('');
  const [watchLoading, setWatchLoading] = useState(false);
  const [showWatchSection, setShowWatchSection] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Paso 1: verificar credenciales
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      if (result.has_pin) {
        // El usuario tiene PIN → mostrar paso 2
        setTempUser(result.user);
        setStep(2);
        setLoading(false);
      } else {
        // Sin PIN → login directo
        const userName = result.user?.nombre || email.split('@')[0];
        showToast(`¡Bienvenido de nuevo, ${userName}!`, 'success');
        router.push('/');
      }
    } else {
      if (result.suspended) {
        router.push('/auth/suspended');
        return;
      }
      setError(result.error);
      showToast(result.error || 'Error al iniciar sesión', 'error');
    }
    setLoading(false);
  };

  // Paso 2: verificar PIN
  const handlePinComplete = async (pin) => {
    setPinError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: tempUser?.id_usuario, pin })
      });
      const data = await res.json();
      if (data.success) {
        const userName = tempUser?.nombre || email.split('@')[0];
        showToast(`¡Bienvenido de nuevo, ${userName}!`, 'success');
        router.push('/');
      } else {
        setPinError('PIN incorrecto. Intenta de nuevo.');
        showToast('PIN incorrecto', 'error');
      }
    } catch {
      setPinError('Error de red. Intenta de nuevo.');
    }
    setLoading(false);
  };

  // Watch QR login
  const handleWatchLogin = async (e) => {
    e.preventDefault();
    setWatchError('');
    setWatchLoading(true);
    const code = watchCode.trim().toUpperCase();
    if (code.length !== 8) {
      setWatchError('El código debe tener 8 caracteres.');
      setWatchLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/watch/qr-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code, userId: 'demo-user' }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('nexa-watch-token', code);
        const result = await login('demo@nexa.com', 'demo1234');
        if (result.success) {
          showToast('¡Sesión iniciada desde Smartwatch! 🕐', 'success');
          router.push('/');
        } else {
          showToast('Código QR válido. Iniciando sesión...', 'success');
          router.push('/');
        }
      } else {
        setWatchError(data.error || 'Código inválido o expirado.');
      }
    } catch {
      setWatchError('Error de conexión. Intenta de nuevo.');
    }
    setWatchLoading(false);
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-card">

        {step === 1 && (
          <>
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
                <div className="auth-input-wrapper">
                  <input
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-btn" disabled={loading} id="login-submit">
                {loading ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
              </button>
            </form>

            <div className="auth-divider">
              <span>O INICIA SESIÓN CON SMARTWATCH</span>
            </div>

            <button
              type="button"
              className="watch-login-toggle"
              id="watch-login-toggle"
              onClick={() => setShowWatchSection(s => !s)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {showWatchSection ? 'Ocultar' : 'Usar código del Smartwatch'}
            </button>

            {showWatchSection && (
              <form onSubmit={handleWatchLogin} className="auth-form watch-form" id="watch-login-form">
                <p className="watch-instructions">
                  Abre la app en tu smartwatch → verás un código QR.<br />
                  Ingresa el <strong>código de 8 letras</strong> que aparece debajo del QR:
                </p>
                {watchError && (
                  <div className="auth-error-banner">
                    <span>{watchError}</span>
                  </div>
                )}
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="watch-code">Código del Reloj</label>
                  <input
                    className="auth-input watch-code-input"
                    type="text"
                    id="watch-code"
                    value={watchCode}
                    onChange={(e) => setWatchCode(e.target.value.toUpperCase().slice(0, 8))}
                    placeholder="ej. AB3D7E2F"
                    maxLength={8}
                    autoCapitalize="characters"
                    spellCheck={false}
                  />
                </div>
                <button type="submit" className="auth-btn watch-submit-btn" disabled={watchLoading} id="watch-login-submit">
                  {watchLoading ? 'VERIFICANDO...' : '🕐 INICIAR SESIÓN CON RELOJ'}
                </button>
              </form>
            )}

            <p className="auth-footer-text">
              ¿No tienes una cuenta?{' '}
              <Link href="/auth/register" className="auth-link">Regístrate aquí</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Confirma tu identidad</h1>
              <p className="auth-subtitle">
                Hola, <strong>{tempUser?.nombre}</strong>. Ingresa tu PIN para continuar.
              </p>
            </div>
            <PinPad
              mode="verify"
              title="Ingresa tu PIN de 4 dígitos"
              subtitle="El PIN que creaste al registrarte"
              error={pinError}
              loading={loading}
              onComplete={handlePinComplete}
            />
            <p className="auth-footer-text" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}
                onClick={() => { setStep(1); setPinError(''); setTempUser(null); }}
              >
                ← Cambiar cuenta
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
