'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SuspendedPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="auth-page" id="suspended-page">
      <div className="auth-card account-suspended-card">
        <div className="account-suspended-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <line x1="12" y1="15" x2="12" y2="17" strokeLinecap="round" strokeWidth="2"/>
          </svg>
        </div>

        <h1 className="account-suspended-title">Cuenta Suspendida</h1>
        <p className="account-suspended-text">
          Tu cuenta ha sido temporalmente suspendida por el equipo de administración de Nexa.
          Tus datos e historial de compras están seguros y no han sido eliminados.
        </p>

        <div className="account-suspended-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p>Si crees que esto es un error, por favor contacta al soporte de Nexa.</p>
        </div>

        <div className="account-suspended-actions">
          <a
            href="mailto:privacidad@nexa.com"
            className="btn-primary"
            style={{ textAlign: 'center' }}
          >
            CONTACTAR SOPORTE
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary"
            style={{ border: '1px solid var(--border)', padding: '12px 20px', cursor: 'pointer' }}
          >
            CERRAR SESIÓN
          </button>
        </div>

        <p className="auth-footer-text">
          <Link href="/" className="auth-link">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
