import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Category, Product } from '../types';
import HeroEditorial from '../components/home/HeroEditorial';
import Marquee from '../components/home/Marquee';
import HotBento from '../components/home/HotBento';
import CategoryStrip from '../components/home/CategoryStrip';
import TrendingGrid from '../components/home/TrendingGrid';
import StorySection from '../components/home/StorySection';
import BigCTA from '../components/home/BigCTA';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listCategories(), api.listProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <HeroEditorial categories={categories} products={products} />
      <Marquee />
      <HotBento products={products} loading={loading} />
      <CategoryStrip categories={categories} loading={loading} />
      <TrendingGrid products={products.slice(0, 8)} loading={loading} />
      <StorySection />
      <BigCTA />
    </div>
  );
}
