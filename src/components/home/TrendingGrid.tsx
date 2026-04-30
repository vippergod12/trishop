import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import Reveal from '../Reveal';
import { formatVnd } from '../../utils/format';

interface Props {
  products: Product[];
  loading?: boolean;
}

export default function TrendingGrid({ products, loading }: Props) {
  return (
    <section className="section">
      <div className="container">
        <Reveal variant="fade-up">
          <div className="trending-heading">
            <span className="section-eyebrow">Mới về</span>
            <h2>Xu hướng tuần này</h2>
          </div>
        </Reveal>

        {loading ? (
          <div className="empty-state">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">Chưa có sản phẩm.</div>
        ) : (
          <div className="trending-grid">
            {products.slice(0, 8).map((p, i) => (
              <Reveal key={p.id} variant="fade-up" delay={i * 70}>
                <Link to={`/san-pham/${p.slug}`} className="trending-card">
                  <div className="trending-image">
                    {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div className="product-card-placeholder">No image</div>}
                    <span className="trending-badge">NEW</span>
                  </div>
                  <div className="trending-meta">
                    <span className="trending-cat">{p.category_name ?? ''}</span>
                    <h3>{p.name}</h3>
                    <span className="trending-price">{formatVnd(p.price)}</span>
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
