import { useEffect, useMemo, useState } from 'react';
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
  const [featured, setFeatured] = useState<Product[]>([]);
  const [hero, setHero] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listCategories(),
      api.listProducts(),
      api.listFeaturedProducts(),
      api.getHeroProduct(),
    ])
      .then(([cats, prods, feat, heroProd]) => {
        setCategories(cats);
        setProducts(prods);
        setFeatured(feat);
        setHero(heroProd);
      })
      .finally(() => setLoading(false));
  }, []);

  const hotProducts = useMemo(() => {
    if (featured.length > 0) return featured;
    return products.slice(0, 8);
  }, [featured, products]);

  return (
    <div className="home">
      <HeroEditorial categories={categories} products={products} hero={hero} />
      <Marquee />
      <HotBento products={hotProducts} loading={loading} />
      <CategoryStrip categories={categories} loading={loading} />
      <TrendingGrid products={products.slice(0, 8)} loading={loading} />
      <StorySection />
      <BigCTA />
    </div>
  );
}
