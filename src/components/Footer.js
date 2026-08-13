'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-column">
            <h4 className="footer-title">Nexa</h4>
            <ul className="footer-links">
              <li><Link href="/about" className="footer-link">Nosotros</Link></li>
              <li><Link href="/about" className="footer-link">Diario</Link></li>
              <li><Link href="/about" className="footer-link">Artesanos</Link></li>
              <li><Link href="/about" className="footer-link">Sostenibilidad</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="footer-title">Tienda</h4>
            <ul className="footer-links">
              <li><Link href="/shop" className="footer-link">Novedades</Link></li>
              <li><Link href="/shop?category=1" className="footer-link">Cerámica</Link></li>
              <li><Link href="/shop?category=2" className="footer-link">Textiles</Link></li>
              <li><Link href="/shop?category=3" className="footer-link">Iluminación</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="footer-title">Servicio</h4>
            <ul className="footer-links">
              <li><Link href="/terms" className="footer-link">Términos y Condiciones</Link></li>
              <li><Link href="/about" className="footer-link">Envíos</Link></li>
              <li><Link href="/about" className="footer-link">Devoluciones</Link></li>
              <li><Link href="/about" className="footer-link">Guía de Cuidados</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="footer-title">Conectar</h4>
            <ul className="footer-links">
              <li><a href="https://instagram.com" className="footer-link" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://pinterest.com" className="footer-link" target="_blank" rel="noopener noreferrer">Pinterest</a></li>
              <li><Link href="/contact" className="footer-link">Boletín</Link></li>
              <li><Link href="/contact" className="footer-link">Contacto</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copyright">
            © 2026 Nexa. Todos los derechos reservados. | <Link href="/terms" style={{ textDecoration: 'underline' }}>Términos y Condiciones</Link>
          </span>
          <span className="footer-tagline">Objetos hechos con dedicación.</span>
        </div>
      </div>
    </footer>
  );
}
