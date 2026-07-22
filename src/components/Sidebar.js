'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const menuSections = [
  {
    title: 'Tienda',
    expandable: true,
    items: [
      { name: 'Novedades', href: '/shop' },
      { name: 'Cerámica', href: '/shop?category=1' },
      { name: 'Textiles', href: '/shop?category=2' },
      { name: 'Iluminación', href: '/shop?category=3' },
      { name: 'Muebles', href: '/shop?category=4' },
      { name: 'Objetos', href: '/shop?category=5' }
    ]
  },
  {
    title: 'Colecciones',
    expandable: true,
    items: [
      { name: 'Verano 2026', href: '/shop' },
      { name: 'Esenciales', href: '/shop' }
    ]
  },
  {
    title: 'Nosotros',
    expandable: true,
    items: [
      { name: 'Nuestra Historia', href: '/about' },
      { name: 'Sostenibilidad', href: '/about' },
      { name: 'Contacto', href: '/contact' }
    ]
  },
  {
    title: 'Diario',
    expandable: false,
    href: '/about'
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const [expandedSections, setExpandedSections] = useState({ Tienda: true });
  const { user } = useAuth();
  const isAdmin = user && (user.id_rol === 1 || user.email === 'admin@nexa.com');

  const toggleSection = (title) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
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
          <span className="sidebar-header-label">NAVEGACIÓN</span>
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

        <div className="sidebar-content">
          <ul className="sidebar-nav-list">
            {menuSections.map((section) => (
              <li key={section.title} className="sidebar-section">
                {section.expandable ? (
                  <>
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
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={section.href}
                    className="sidebar-section-title sidebar-section-link"
                    onClick={onClose}
                  >
                    <span>{section.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer-container">
          <div className="sidebar-footer-links">
            {isAdmin && (
              <Link href="/dashboard" className="sidebar-footer-link" onClick={onClose}>
                PANEL DE CONTROL <span className="arrow">→</span>
              </Link>
            )}
            <Link href="/studio" className="sidebar-footer-link" onClick={onClose} style={{ color: 'var(--accent-gold)' }}>
              STUDIO 3D EXPERIMENTAL <span className="arrow">→</span>
            </Link>
            <Link href="/shop" className="sidebar-footer-link" onClick={onClose}>
              EXPLORAR CATÁLOGO <span className="arrow">→</span>
            </Link>
            <Link href="/contact" className="sidebar-footer-link" onClick={onClose}>
              CONTACTO Y ATENCIÓN <span className="arrow">→</span>
            </Link>
          </div>
          <div className="sidebar-brand-badge">
            <div className="brand-circle">N</div>
            <span className="brand-tagline">NEXA — Objetos Curados</span>
          </div>
        </div>
      </nav>
    </>
  );
}
