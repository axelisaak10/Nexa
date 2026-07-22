'use client';

import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="product-grid" id="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id_producto} product={product} index={index} />
      ))}
    </div>
  );
}
