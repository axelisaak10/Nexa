'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { totalItems, toggleDrawer } = useCart();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  const isAdmin = user && (user.id_rol === 1 || user.email === 'admin@nexa.com');

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="header" id="main-header">
        <div className="header-inner">
          <div className="header-left">
            <button
              className="header-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú de navegación"
              id="hamburger-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <Link href="/" className="header-logo" id="logo-link">
            NEXA
          </Link>

          <div className="header-actions">
            <Link href="/studio" className="header-studio-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span>STUDIO 3D</span>
            </Link>

            {isAdmin && (
              <Link href="/dashboard" className="header-nav-btn header-panel-btn" id="dashboard-link">
                PANEL
              </Link>
            )}
            
            {user ? (
              <div className="header-profile-menu-container" ref={dropdownRef}>
                <button
                  className="header-profile-avatar-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="Menú de perfil"
                  aria-expanded={userDropdownOpen}
                  id="user-profile-menu-btn"
                >
                  <span className="profile-avatar-circle">
                    {getInitial(user.nombre)}
                  </span>
                  <span className="profile-user-name">
                    {user.nombre ? user.nombre.split(' ')[0] : 'Usuario'}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`profile-chevron ${userDropdownOpen ? 'open' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="header-profile-dropdown" id="user-profile-dropdown">
                    <div className="profile-dropdown-header">
                      <p className="profile-dropdown-name">{user.nombre || 'Usuario'}</p>
                      <p className="profile-dropdown-email">{user.email}</p>
                    </div>
                    <div className="profile-dropdown-divider" />
                    <Link
                      href="/profile"
                      className="profile-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Mi Perfil</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/dashboard"
                        className="profile-dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span>Panel Administrador</span>
                      </Link>
                    )}
                    <div className="profile-dropdown-divider" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="profile-dropdown-item logout-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
