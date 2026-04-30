import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { Category } from '../../types';
import Reveal from '../Reveal';
import { useDragScroll } from '../../hooks/useDragScroll';

interface Props {
  categories: Category[];
  loading?: boolean;
}

export default function CategoryStrip({ categories, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useDragScroll(scrollRef);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setOverflowing(el.scrollWidth > el.clientWidth + 4);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [categories.length]);

  if (loading) return null;

  return (
    <section className="section section-strip">
      <div className="container">
        <Reveal variant="fade-up">
          <div className="strip-heading">
            <div>
              <span className="section-eyebrow">Tuyển chọn</span>
              <h2>Khám phá theo danh mục</h2>
            </div>
            {overflowing && <p>Cuộn ngang →</p>}
          </div>
        </Reveal>

        <div className={`strip-scroll ${overflowing ? 'is-overflowing' : ''}`} ref={scrollRef}>
          <div className={`strip-track ${overflowing ? '' : 'no-overflow'}`}>
            {categories.map((c, i) => (
              <Reveal
                key={c.id}
                variant="fade-up"
                delay={i * 60}
                className="strip-cell"
              >
                <Link to={`/danh-muc/${c.slug}`} className="strip-card" draggable={false}>
                  <div className="strip-image">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} draggable={false} />
                    ) : (
                      <div className="strip-fallback">
                        <span>{c.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="strip-overlay" aria-hidden />
                    <span className="strip-num">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="strip-meta">
                    <h3>{c.name}</h3>
                    <span>{c.product_count ?? 0} sản phẩm →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
