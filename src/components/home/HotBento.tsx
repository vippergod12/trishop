import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import Reveal from '../Reveal';
import { formatVnd } from '../../utils/format';

interface Props {
  products: Product[];
  loading?: boolean;
}

type Slot = 'hero' | 'tall' | 'small';

// Layout 4-col x 3-row magazine, 8 items total:
//   [ HERO  HERO  TALL  small ]
//   [ HERO  HERO  TALL  small ]
//   [ small small small small ]
const SLOTS: Slot[] = ['hero', 'tall', 'small', 'small', 'small', 'small', 'small', 'small'];

function Fallback({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '·';
  return (
    <div className="bento-fallback">
      <span className="bento-fallback-mark">{initial}</span>
      <span className="bento-fallback-text">{name}</span>
    </div>
  );
}

export default function HotBento({ products, loading }: Props) {
  const items = products.slice(0, 8);

  return (
    <section id="hot" className="section section-hot">
      <div className="container">
        <Reveal variant="fade-up">
          <div className="hot-heading">
            <div>
              <span className="section-eyebrow">★ Hot 2026</span>
              <h2>Đang được săn đón</h2>
            </div>
            <p>Cuộn xuống để khám phá những sản phẩm được yêu thích nhất tuần này.</p>
          </div>
        </Reveal>

        {loading ? (
          <div className="empty-state">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">Chưa có sản phẩm.</div>
        ) : (
          <div className="bento">
            {items.map((p, i) => {
              const slot = SLOTS[i] ?? 'small';
              return (
                <Reveal
                  key={p.id}
                  variant="fade-up"
                  delay={i * 80}
                  className={`bento-cell bento-${slot}`}
                >
                  <Link to={`/san-pham/${p.slug}`} className="bento-card">
                    <div className="bento-image">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} loading="lazy" />
                      ) : (
                        <Fallback name={p.name} />
                      )}
                    </div>
                    <div className="bento-overlay" aria-hidden />
                    <span className="bento-tag">#{i + 1} HOT</span>
                    <div className="bento-info">
                      <span className="bento-cat">{p.category_name ?? ''}</span>
                      <h3>{p.name}</h3>
                      <span className="bento-price">{formatVnd(p.price)}</span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
