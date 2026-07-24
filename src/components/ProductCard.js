'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext';

export default function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id_producto);
  const categoryName = product.categorias?.nombre || 'Objetos';

  return (
    <article
      className="product-card"
      id={`product-card-${product.id_producto}`}
    >
      <Link href={`/product/${product.id_producto}`} className="product-card-link">
        <div className="product-card-image-wrapper">
          <Image
            src={product.url_imagen || '/images/products/travertine_tray.png'}
            alt={product.nombre}
            width={400}
            height={400}
            className="product-card-image"
          />
          {product.badge && (
            <span className={`product-card-badge ${product.badge === 'NUEVO' ? 'badge-new' : 'badge-bestseller'}`}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>
      <button
        className={`product-card-favorite ${favorite ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product);
        }}
        aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>
      <div className="product-card-info">
        <span className="product-card-category">{categoryName.toUpperCase()}</span>
        <h3 className="product-card-name">
          <Link href={`/product/${product.id_producto}`}>
            {product.nombre}
          </Link>
        </h3>
        <div className="product-card-bottom">
          <span className="product-card-price">${product.precio}</span>
          {product.rating && (
            <span className="product-card-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#B8860B" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {product.rating} ({product.reviews})
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
