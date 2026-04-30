import { fetchHome } from '@/lib/data';
import HeroEditorial from '@/components/home/HeroEditorial';
import Marquee from '@/components/home/Marquee';
import HotBento from '@/components/home/HotBento';
import TrendingGrid from '@/components/home/TrendingGrid';
import StorySection from '@/components/home/StorySection';
import BigCTA from '@/components/home/BigCTA';
import CategoryStrip from '@/components/home/CategoryStrip';
import {
  itemListJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo/jsonLd';

// ISR: trang chủ revalidate mỗi 60 giây
export const revalidate = 60;

export default async function HomePage() {
  const bundle = await fetchHome().catch(() => ({
    categories: [],
    products: [],
    featured: [],
    hero: null,
  }));

  const { categories, products, featured, hero } = bundle;
  const hotProducts = featured.length > 0 ? featured : products.slice(0, 8);

  const jsonLd: unknown[] = [organizationJsonLd(), websiteJsonLd()];
  if (hotProducts.length > 0) {
    jsonLd.push(itemListJsonLd(hotProducts.slice(0, 12), '/'));
  }

  return (
    <div className="home">
      {jsonLd.map((data, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <HeroEditorial categories={categories} products={products} hero={hero} />
      <Marquee />
      <HotBento products={hotProducts} />
      <CategoryStrip categories={categories} />
      <TrendingGrid products={products.slice(0, 8)} />
      <StorySection />
      <BigCTA />
    </div>
  );
}
