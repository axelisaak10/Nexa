import SearchBar from '@/components/SearchBar';
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import { getProductos } from '@/lib/mockData';

export default async function HomePage() {
  const products = await getProductos();
  const featuredProducts = products.slice(0, 6);

  return (
    <>
      <SearchBar />
      <HeroSection />
      
      <section className="section-padding container" id="featured-products">
        <div className="section-header">
          <h2 className="section-title">Colección Destacada</h2>
          <p className="section-subtitle">Piezas seleccionadas para un estilo de vida consciente</p>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>
    </>
  );
}
