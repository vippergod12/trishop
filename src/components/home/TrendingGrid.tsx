import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import Reveal from '../Reveal';
import { PriceDisplay, SaleBadge } from '../SaleBadge';

interface Props {
  products: Product[];
  loading?: boolean;
}

const NEW_DAYS = 14;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / MS_PER_DAY;
  return ageDays >= 0 && ageDays <= NEW_DAYS;
}

export default function TrendingGrid({ products, loading }: Props) {
  const items = [...products]
    .sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 8);

  return (
    <section className="section">
      <div className="container">
        <Reveal variant="fade-up">
          <div className="trending-heading">
            <span className="section-eyebrow">Vừa cập kệ</span>
            <h2>Sản phẩm mới</h2>
          </div>
        </Reveal>

        {loading ? (
          <div className="empty-state">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">Chưa có sản phẩm.</div>
        ) : (
          <div className="trending-grid">
            {items.map((p, i) => (
              <Reveal key={p.id} variant="fade-up" delay={i * 70}>
                <Link
                  to={`/san-pham/${p.slug}`}
                  className={`trending-card ${!p.is_active ? 'is-soldout' : ''}`}
                  draggable={false}
                >
                  <div className="trending-image">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} draggable={false} />
                    ) : (
                      <div className="product-card-placeholder">No image</div>
                    )}
                    {p.is_active ? (
                      <SaleBadge product={p} />
                    ) : (
                      <div className="soldout-overlay">
                        <span>Hết hàng</span>
                      </div>
                    )}
                    {p.is_active && isNew(p.created_at) && <span className="trending-badge">MỚI</span>}
                  </div>
                  <div className="trending-meta">
                    <span className="trending-cat">{p.category_name ?? ''}</span>
                    <h3>{p.name}</h3>
                    <PriceDisplay product={p} className="trending-price" showEndDate />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
