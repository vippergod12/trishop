import { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '../../types';

interface Props {
  categories: Category[];
  products: Product[];
  /** Sản phẩm hero được admin chọn (ưu tiên cao nhất). null = chưa cấu hình. */
  hero?: Product | null;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop';

function pickImage(items: Array<{ image_url?: string | null }>): string | null {
  for (const it of items) {
    const url = it.image_url?.trim();
    if (url) return url;
  }
  return null;
}

export default function HeroEditorial({ categories, products, hero }: Props) {
  const [time, setTime] = useState(() => new Date());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const heroImage = useMemo(() => {
    const fromAdmin = hero?.image_url?.trim();
    if (fromAdmin) return fromAdmin;
    return pickImage(products) ?? pickImage(categories) ?? FALLBACK_IMAGE;
  }, [hero?.image_url, products, categories]);

  const heroAlt = hero?.name ?? '';

  useEffect(() => {
    setImgError(false);
  }, [heroImage]);

  const monthYear = time.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  const finalSrc = imgError ? FALLBACK_IMAGE : heroImage;

  return (
    <section className="hero-editorial">
      <div className="container hero-edit-grid">
        <div className="hero-edit-meta">
          <span className="hero-edit-tag">● In Stock</span>
          <span className="hero-edit-date">{monthYear}</span>
          <span className="hero-edit-loc">VN — Worldwide ship</span>
        </div>

        <div className="hero-edit-headline">
          <h1>
            <span>Designed</span>
            <span className="hero-edit-italic">for everyday</span>
            <span>elegance.</span>
          </h1>
        </div>

        <div className="hero-edit-side">
          <div className="hero-edit-image">
            <img
              src={finalSrc}
              alt={heroAlt}
              onError={() => setImgError(true)}
            />
          </div>
          <p className="hero-edit-desc">
            Bộ sưu tập tối giản, chất liệu tốt, mức giá hợp lý.
            Dành cho người yêu sự tinh tế.
          </p>
          <a
            href="#hot"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('hot')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hero-edit-cta"
          >
            Xem hàng hot ↘
          </a>
        </div>

        <div className="hero-edit-bottom">
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">{categories.length || '—'}</span>
            <span className="hero-edit-stat-label">Danh mục</span>
          </div>
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">7d</span>
            <span className="hero-edit-stat-label">Đổi trả</span>
          </div>
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">24h</span>
            <span className="hero-edit-stat-label">Phản hồi</span>
          </div>
        </div>
      </div>
    </section>
  );
}
