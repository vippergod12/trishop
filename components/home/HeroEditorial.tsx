'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '@/lib/types';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo/siteConfig';

interface Props {
  categories: Category[];
  products: Product[];
  /** Sản phẩm hero được admin chọn (ưu tiên cao nhất). null = chưa cấu hình. */
  hero?: Product | null;
  /** Đang fetch dữ liệu lần đầu — chưa đủ thông tin để chọn ảnh */
  loading?: boolean;
}

function pickImage(items: Array<{ image_url?: string | null }>): string | null {
  for (const it of items) {
    const url = it.image_url?.trim();
    if (url) return url;
  }
  return null;
}

export default function HeroEditorial({ categories, products, hero, loading }: Props) {
  const [time, setTime] = useState(() => new Date());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const heroImage = useMemo<string | null>(() => {
    const fromAdmin = hero?.image_url?.trim();
    if (fromAdmin) return fromAdmin;
    return pickImage(products) ?? pickImage(categories) ?? null;
  }, [hero?.image_url, products, categories]);

  const heroAlt = hero?.name
    ? `${hero.name} — Bộ sưu tập nổi bật ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;

  useEffect(() => {
    setImgError(false);
  }, [heroImage]);

  const monthYear = time.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  const showImage = !loading && !!heroImage && !imgError;

  return (
    <section className="hero-editorial">
      <div className="container hero-edit-grid">
        <div className="hero-edit-meta">
          <span className="hero-edit-tag">● In Stock</span>
          <span className="hero-edit-date">{monthYear}</span>
          <span className="hero-edit-loc">VN — Worldwide ship</span>
        </div>

        <div className="hero-edit-headline">
          <h1 className="hero-edit-title">
            <span className="hero-edit-title-statement">Thanh lịch</span>
            <span className="hero-edit-title-eyebrow">
              <span className="hero-edit-title-rule" aria-hidden />
              trong từng
            </span>
            <span className="hero-edit-title-accent">khoảnh khắc.</span>
          </h1>
        </div>

        <div className="hero-edit-side">
          <div className={`hero-edit-image ${showImage ? '' : 'is-placeholder'}`}>
            {showImage ? (
              <Image
                src={heroImage as string}
                alt={heroAlt}
                onError={() => setImgError(true)}
                fill
                priority
                sizes="(max-width: 768px) 90vw, 50vw"
                className="hero-edit-image-img"
              />
            ) : (
              <div className="hero-edit-image-skeleton" aria-hidden>
                <span className="hero-edit-image-mark">D</span>
              </div>
            )}
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
      </div>
    </section>
  );
}
