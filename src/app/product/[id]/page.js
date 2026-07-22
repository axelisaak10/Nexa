import ProductDetailClient from './ProductDetailClient';
import { getProductoById, getProductos } from '@/lib/mockData';

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProductoById(id);
  const allProducts = await getProductos();
  const relatedProducts = allProducts
    .filter(p => p.id_producto !== parseInt(id))
    .slice(0, 3);

  if (!product) {
    return (
      <div className="container section-padding text-center">
        <h1>Product not found</h1>
        <p>The product you are looking for does not exist.</p>
      </div>
    );
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
