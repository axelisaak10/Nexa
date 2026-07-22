'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { totalItems, toggleDrawer } = useCart();
  const { user, logout } = useAuth();

  const isAdmin = user && (user.id_rol === 1 || user.email === 'admin@nexa.com');

  return (
    <>
      <header className="header" id="main-header">
        <div className="header-inner">
          <button
            className="header-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
            id="hamburger-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link href="/" className="header-logo" id="logo-link">
            NEXA
          </Link>

          <div className="header-actions">
            <Link href="/studio" className="header-nav-btn studio-link-btn" style={{ border: '1px solid var(--accent)', color: 'var(--accent)', fontWeight: 'bold' }}>
              STUDIO 3D
            </Link>

            {isAdmin && (
              <Link href="/dashboard" className="header-nav-btn header-panel-btn" id="dashboard-link">
                PANEL
              </Link>
            )}
            
            {user ? (
              <div className="header-user-badge">
                <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className="user-greeting">Hola, {user.nombre ? user.nombre.split(' ')[0] : 'Usuario'}</span>
                </Link>
                <button onClick={logout} className="header-logout-chip" title="Cerrar sesión">
                  SALIR
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="header-nav-btn header-login-btn" id="login-link">
                ENTRAR
              </Link>
            )}

            <button
              className="header-cart-btn"
              onClick={toggleDrawer}
              aria-label="Abrir carrito de compras"
              id="cart-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="header-cart-badge" id="cart-badge">{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CartDrawer />
    </>
  );
}
