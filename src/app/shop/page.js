'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ProductGrid from '@/components/ProductGrid';

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const fetchProducts = async (categoryId, search) => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (categoryId) params.set('category', categoryId);
      if (search) params.set('search', search);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(parseInt(categoryParam));
    } else {
      setActiveCategory(null);
    }
    fetchProducts(categoryParam, searchParam);
  }, [categoryParam, searchParam]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    fetchProducts(categoryId, searchParam);
  };

  return (
    <>
      <SearchBar />
      <div className="container section-padding">
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="product-card-skeleton">
                <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
                <div className="skeleton" style={{ height: '12px', width: '40%', marginTop: '12px' }} />
                <div className="skeleton" style={{ height: '18px', width: '70%', marginTop: '8px' }} />
                <div className="skeleton" style={{ height: '14px', width: '30%', marginTop: '8px' }} />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container section-padding text-center">
        <div className="spinner" style={{ margin: 'auto' }} />
        <p style={{ marginTop: '16px' }}>Cargando colección...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
