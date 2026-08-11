'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import PinPad from '@/components/PinPad';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1 = datos, 2 = crear PIN
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState(null); // usuario recién creado

  const { user, register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Paso 1: registrar cuenta
  const handleSubmitData = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const result = await register(nombre, email, password);
    if (result.success) {
      setNewUser(result.user);
      setStep(2); // avanzar a crear PIN
      showToast('¡Cuenta creada! Ahora crea tu PIN de seguridad.', 'success');
    } else {
      setError(result.error);
      showToast(result.error || 'Error al registrar', 'error');
    }
    setLoading(false);
  };

  // Paso 2: guardar PIN
  const handlePinComplete = async (pin) => {
    setPinError('');
    setLoading(true);
    const targetUserId = newUser?.id_usuario || user?.id_usuario;
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: targetUserId, pin })
      });
      const data = await res.json();
      if (data.success) {
        showToast('¡PIN guardado! Bienvenido a Nexa.', 'success');
        router.push('/');
      } else {
        setPinError(data.error || 'Error al guardar PIN. Intenta de nuevo.');
        showToast(data.error || 'Error al guardar PIN', 'error');
      }
    } catch {
      setPinError('Error de red. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-card">

        {/* Progress indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <span className="auth-step-num">{step > 1 ? '✓' : '1'}</span>
            <span className="auth-step-label">Tus datos</span>
          </div>
          <div className="auth-step-line" />
          <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>
            <span className="auth-step-num">2</span>
            <span className="auth-step-label">Tu PIN</span>
          </div>
        </div>

        {step === 1 && (
          <>
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

            <form onSubmit={handleSubmitData} className="auth-form">
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
                <div className="auth-input-wrapper">
                  <input
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    id="register-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
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
              <button type="submit" className="auth-btn" disabled={loading} id="register-submit">
                {loading ? 'CREANDO CUENTA...' : 'CONTINUAR'}
              </button>
            </form>

            <p className="auth-footer-text">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/login" className="auth-link">Inicia sesión</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Crea tu PIN</h1>
            </div>
            <PinPad
              mode="create"
              title="Elige un PIN de 4 dígitos"
              subtitle="Lo usarás para confirmar compras y acceder desde el smartwatch"
              error={pinError}
              loading={loading}
              onComplete={handlePinComplete}
            />
            <p className="auth-footer-text" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}
                onClick={() => { showToast('Puedes configurar tu PIN más tarde en tu perfil.', 'success'); router.push('/'); }}
              >
                Configurar más tarde →
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
