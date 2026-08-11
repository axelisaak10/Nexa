'use client';

import { useFavorites } from '@/context/FavoritesContext';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites, mounted } = useFavorites();

  if (!mounted) {
    return (
      <div className="container section-padding text-center">
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', padding: '60px 0' }}>
          Cargando tus favoritos desde la base de datos...
        </p>
      </div>
    );
  }

  return (
    <div className="container section-padding">
      <div className="text-center" style={{ marginBottom: '40px' }}>
        <h1 className="page-title">Tus Favoritos</h1>
        <p className="page-subtitle">Piezas guardadas directamente en tu cuenta Nexa.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center" style={{ padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No tienes favoritos guardados</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Haz clic en el corazón en cualquier producto para guardarlo en tu lista personal.
          </p>
          <Link href="/shop" className="btn-primary">
            EXPLORAR TIENDA
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {favorites.map(product => (
            <ProductCard key={product.id_producto} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
