'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ProductGrid from '@/components/ProductGrid';

export default function ProductDetailClient({ product, relatedProducts }) {
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const { addToCart } = useCart();

  const categoryName = product.categorias?.nombre || 'Objects';

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  };

  return (
    <div className="container section-padding">
      <div className="product-detail" id="product-detail">
        <div className="product-detail-image-container">
          <Image
            src={product.url_imagen || '/images/products/travertine_tray.png'}
            alt={product.nombre}
            width={700}
            height={700}
            className="product-detail-image"
            priority
          />
        </div>
        <div className="product-detail-info">
          <span className="product-detail-category">{categoryName.toUpperCase()}</span>
          <h1 className="product-detail-name">{product.nombre}</h1>
          <p className="product-detail-price">${product.precio}</p>
          
          {product.rating && (
            <div className="product-detail-rating">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#B8860B" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{product.rating} ({product.reviews} reviews)</span>
            </div>
          )}

          <p className="product-detail-short-desc">{product.descripcion_corta}</p>
          <p className="product-detail-description">{product.descripcion_larga}</p>

          <div className="product-detail-actions">
            <div className="quantity-selector" id="quantity-selector">
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              id="add-to-cart"
            >
              {addedMessage ? '✓ ADDED TO CART' : 'ADD TO CART'}
            </button>
          </div>

          <div className="product-detail-meta">
            <div className="meta-item">
              <span className="meta-label">Stock</span>
              <span className="meta-value">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Shipping</span>
              <span className="meta-value">Free shipping on orders over $100</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Returns</span>
              <span className="meta-value">30-day free returns</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="section-padding" id="related-products">
          <h2 className="section-title">You may also like</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
