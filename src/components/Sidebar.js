'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const menuSections = [
  {
    title: 'Categorías de Tienda',
    expandable: true,
    items: [
      { name: 'Todas las Novedades', href: '/shop' },
      { name: 'Cerámica Artesanal', href: '/shop?category=1' },
      { name: 'Textiles Orgánicos', href: '/shop?category=2' },
      { name: 'Iluminación Escultórica', href: '/shop?category=3' },
      { name: 'Muebles de Diseño', href: '/shop?category=4' },
      { name: 'Objetos y Accesorios', href: '/shop?category=5' }
    ]
  },
  {
    title: 'Colecciones Especiales',
    expandable: true,
    items: [
      { name: 'Colección Verano 2026', href: '/shop' },
      { name: 'Piezas Esenciales', href: '/shop' }
    ]
  },
  {
    title: 'Sobre Nexa',
    expandable: true,
    items: [
      { name: 'Nuestra Historia & Filosofía', href: '/about' },
      { name: 'Compromiso Sostenible', href: '/about' },
      { name: 'Atención al Cliente & Contacto', href: '/contact' }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const [expandedSections, setExpandedSections] = useState({ 'Categorías de Tienda': true });
  const { user, logout } = useAuth();
  const isAdmin = user && (user.id_rol === 1 || user.email === 'admin@nexa.com');

  const toggleSection = (title) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          id="sidebar-overlay"
        />
      )}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar-nav" aria-label="Navegación principal">
        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <span className="sidebar-logo-text">NEXA</span>
            <span className="sidebar-header-label">NAVEGACIÓN</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Cerrar navegación"
            id="sidebar-close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {user ? (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {getInitial(user.nombre)}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.nombre || 'Usuario Nexa'}</span>
              <span className="sidebar-user-email">{user.email}</span>
            </div>
            <Link href="/profile" onClick={onClose} className="sidebar-user-link" title="Ver perfil">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="sidebar-auth-banner">
            <p>Accede para guardar favoritos y sincronizar tu experiencia.</p>
            <Link href="/auth/login" className="sidebar-login-btn" onClick={onClose}>
              INICIAR SESIÓN / REGISTRO
            </Link>
          </div>
        )}

        <div className="sidebar-content">
          <ul className="sidebar-nav-list">
            {menuSections.map((section) => (
              <li key={section.title} className="sidebar-section">
                <button
                  className="sidebar-section-title"
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={!!expandedSections[section.title]}
                >
                  <span>{section.title}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`sidebar-chevron ${expandedSections[section.title] ? 'expanded' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedSections[section.title] && (
                  <ul className="sidebar-subitems">
                    {section.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="sidebar-subitem-link"
                          onClick={onClose}
                        >
                          <span className="bullet-dot">•</span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer-container">
          <div className="sidebar-footer-links">
            <Link href="/studio" className="sidebar-footer-link studio-highlight" onClick={onClose}>
              <span className="footer-link-text">STUDIO 3D EXPERIMENTAL</span>
              <span className="arrow">→</span>
            </Link>
            <Link href="/shop" className="sidebar-footer-link" onClick={onClose}>
              <span className="footer-link-text">EXPLORAR TODO EL CATÁLOGO</span>
              <span className="arrow">→</span>
            </Link>
            {isAdmin && (
              <Link href="/dashboard" className="sidebar-footer-link admin-highlight" onClick={onClose}>
                <span className="footer-link-text">PANEL DE ADMINISTRACIÓN</span>
                <span className="arrow">→</span>
              </Link>
            )}
            {user && (
              <button onClick={() => { onClose(); logout(); }} className="sidebar-logout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>CERRAR SESIÓN</span>
              </button>
            )}
          </div>

          <div className="sidebar-brand-badge">
            <div className="brand-circle">N</div>
            <div className="brand-info">
              <span className="brand-title">NEXA</span>
              <span className="brand-tagline">Objetos & Espacios Curados</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
