'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="hero" id="hero-section">
      <div className="hero-text">
        <span className="hero-label">COLECCIÓN DE VERANO — 2026</span>
        <h1 className="hero-title">
          Objetos que{' '}
          <span className="hero-title-accent">ganan su lugar.</span>
        </h1>
        <p className="hero-description">
          Cada pieza es seleccionada por la honestidad de sus materiales y
          las manos artesanales que la crearon. Sin excesos. Sin ruido.
        </p>
        <div className="hero-buttons">
          <Link href="/shop" className="hero-btn-primary" id="shop-collection-btn">
            EXPLORAR COLECCIÓN
          </Link>
          <Link href="/about" className="hero-btn-secondary" id="read-journal-btn">
            LEER DIARIO
          </Link>
        </div>
      </div>
      <div className="hero-grid">
        <div className="hero-grid-main">
          <Image
            src="/images/products/hero_armchair.png"
            alt="Sillón de Acento Mostaza"
            width={600}
            height={500}
            className="hero-grid-image"
            priority
          />
          <span className="hero-product-label">
            Bandeja de Travertino — $95
          </span>
        </div>
        <div className="hero-grid-secondary">
          <div className="hero-grid-item">
            <Image
              src="/images/products/ceramics_cups.png"
              alt="Colección de Tazas de Cerámica Artesanal"
              width={300}
              height={240}
              className="hero-grid-image"
            />
          </div>
          <div className="hero-grid-item">
            <Image
              src="/images/products/stoneware_vase.png"
              alt="Jarrón de Cerámica Ceniza"
              width={300}
              height={240}
              className="hero-grid-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
