import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { Category, Product } from '../types';
import HeroEditorial from '../components/home/HeroEditorial';
import Marquee from '../components/home/Marquee';
import HotBento from '../components/home/HotBento';
import TrendingGrid from '../components/home/TrendingGrid';
import StorySection from '../components/home/StorySection';
import BigCTA from '../components/home/BigCTA';

// CategoryStrip dùng Swiper (~31 KB gzip). Lazy để Swiper không nằm trong
// initial bundle của trang chủ — paint hero & hot ngay, strip render sau.
const CategoryStrip = lazy(() => import('../components/home/CategoryStrip'));

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [hero, setHero] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getHome()
      .then((bundle) => {
        setCategories(bundle.categories);
        setProducts(bundle.products);
        setFeatured(bundle.featured);
        setHero(bundle.hero);
      })
      .finally(() => setLoading(false));
  }, []);

  const hotProducts = useMemo(() => {
    if (featured.length > 0) return featured;
    return products.slice(0, 8);
  }, [featured, products]);

  return (
    <div className="home">
      <HeroEditorial categories={categories} products={products} hero={hero} loading={loading} />
      <Marquee />
      <HotBento products={hotProducts} loading={loading} />
      <Suspense fallback={null}>
        <CategoryStrip categories={categories} loading={loading} />
      </Suspense>
      <TrendingGrid products={products.slice(0, 8)} loading={loading} />
      <StorySection />
      <BigCTA />
    </div>
  );
}
