import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types';
import { formatVnd } from '../utils/format';
import { getSaleInfo } from '../utils/sale';
import { SaleBadge } from '../components/SaleBadge';
import ProductCarousel from '../components/ProductCarousel';
import { ZALO_ENABLED, ZALO_URL } from '../utils/zalo';

function formatSaleEnd(date: Date): string {
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildZaloMessage(
  product: Product,
  price: number,
  color: string | null,
): string {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  return [
    `Xin chào shop, mình muốn mua sản phẩm:`,
    `• ${product.name}`,
    color ? `• Màu: ${color}` : '',
    `• Giá: ${formatVnd(price)}`,
    url ? `• Link: ${url}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function handleZaloContact(
  product: Product,
  price: number,
  color: string | null,
) {
  const message = buildZaloMessage(product, price, color);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(message);
    }
  } catch {
    /* bỏ qua nếu clipboard bị chặn */
  }
  window.open(ZALO_URL, '_blank', 'noopener,noreferrer');
}

export default function ProductDetailPage() {
  const { slug = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [hot, setHot] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setRelated([]);
    setHot([]);
    setSelectedColor(null);
    window.scrollTo({ top: 0, behavior: 'auto' });

    api
      .getProduct(slug)
      .then((p) => {
        setProduct(p);
        if (Array.isArray(p.colors) && p.colors.length === 1) setSelectedColor(p.colors[0]);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Sau khi có product, fetch các nhóm gợi ý
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    Promise.all([
      api.listProducts({ category: product.category_slug ?? product.category_id }),
      api.listFeaturedProducts(),
    ])
      .then(([sameCat, featured]) => {
        if (cancelled) return;
        setRelated(sameCat.filter((p) => p.id !== product.id).slice(0, 12));
        setHot(featured.filter((p) => p.id !== product.id).slice(0, 12));
      })
      .catch(() => {
        /* không có thì thôi, không cản trở trang chính */
      });
    return () => {
      cancelled = true;
    };
  }, [product]);

  const sale = useMemo(() => (product ? getSaleInfo(product) : null), [product]);

  if (loading) return <div className="container section"><div className="empty-state">Đang tải...</div></div>;
  if (error || !product || !sale)
    return (
      <div className="container section">
        <div className="empty-state">{error ?? 'Không tìm thấy sản phẩm.'}</div>
      </div>
    );

  return (
    <>
      <section className="section">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to={`/danh-muc/${product.category_slug ?? ''}`}>{product.category_name}</Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>

          <div className={`product-detail ${!product.is_active ? 'is-soldout' : ''}`}>
          <div className="product-detail-media">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} />
            ) : (
              <div className="product-card-placeholder">No image</div>
            )}
            <SaleBadge product={product} />
            {!product.is_active && (
              <div className="soldout-overlay">
                <span>Hết hàng</span>
              </div>
            )}
          </div>
          <div className="product-detail-info">
            <h1>{product.name}</h1>
            {sale.isOnSale ? (
              <div className="product-detail-price-group">
                <div className="product-detail-price">{formatVnd(sale.effectivePrice)}</div>
                <div className="product-detail-price-original">
                  <span className="strike">{formatVnd(sale.originalPrice)}</span>
                  <span className="discount-tag">-{sale.discountPercent}%</span>
                </div>
                {sale.saleEndAt && (
                  <p className="sale-countdown">
                    Sale kết thúc lúc <strong>{formatSaleEnd(sale.saleEndAt)}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="product-detail-price">{formatVnd(product.price)}</div>
            )}
            <p className="product-detail-description">
              {product.description || 'Chưa có mô tả cho sản phẩm này.'}
            </p>

            {product.colors && product.colors.length > 0 && (
              <div className="variant-block">
                <div className="variant-label">
                  <span>Màu sắc</span>
                  {selectedColor && <em>{selectedColor}</em>}
                </div>
                <div className="variant-options">
                  {product.colors.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`variant-chip ${selectedColor === c ? 'is-selected' : ''}`}
                      onClick={() => setSelectedColor(selectedColor === c ? null : c)}
                      disabled={!product.is_active}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-detail-meta">
              <div>
                <span className="meta-label">Danh mục</span>
                <span>{product.category_name}</span>
              </div>
              <div>
                <span className="meta-label">Tình trạng</span>
                <span className={product.is_active ? 'status-on' : 'status-off'}>
                  {product.is_active ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>
              <div>
                <span className="meta-label">Mã sản phẩm</span>
                <span>#{product.id}</span>
              </div>
            </div>
            {product.is_active && ZALO_ENABLED ? (
              <div className="product-detail-cta">
                <button
                  type="button"
                  className="btn-zalo"
                  onClick={() => handleZaloContact(product, sale.effectivePrice, selectedColor)}
                  aria-label="Liên hệ shop qua Zalo để mua"
                >
                  <svg
                    viewBox="0 0 64 64"
                    width="22"
                    height="22"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="M32 6C16.5 6 4 16.7 4 30c0 7 3.5 13.3 9.2 17.6-.5 2.5-1.7 5.7-4 8 .3.4.8.6 1.4.5 4.3-.5 8.5-2.2 11.5-3.7 3.2.9 6.5 1.4 9.9 1.4 15.5 0 28-10.7 28-24S47.5 6 32 6zm-9.6 28.7h-6.7c-.6 0-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v8.5h5.7c.6 0 1 .4 1 1s-.4 1-1 1zm5-1c0 .6-.4 1-1 1s-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v9.5zm9.4 0c0 .6-.4 1-1 1-.3 0-.6-.2-.8-.4l-5-6.6v6c0 .6-.4 1-1 1s-1-.4-1-1v-9.5c0-.6.4-1 1-1 .3 0 .6.2.8.4l5 6.6v-6c0-.6.4-1 1-1s1 .4 1 1v9.5zm10.6 0c0 .3-.2.6-.4.8-.2.2-.4.3-.6.3h-6c-.6 0-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v8.5h5c.6 0 1 .4 1 .9z"
                    />
                  </svg>
                  Liên hệ ngay để được tư vấn
                </button>
                <span className="product-detail-cta-hint">
                  {selectedColor
                    ? `Đang chọn màu: ${selectedColor} — thông tin đã copy vào clipboard.`
                    : 'Bấm để mở Zalo — thông tin sản phẩm đã được copy vào clipboard.'}
                </span>
              </div>
            ) : !product.is_active ? (
              <div className="product-detail-cta">
                <button type="button" className="btn-zalo is-disabled" disabled>
                  Sản phẩm tạm hết hàng
                </button>
                <span className="product-detail-cta-hint">
                  Vui lòng quay lại sau hoặc xem các sản phẩm tương tự bên dưới.
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      </section>

      {related.length > 0 && (
        <ProductCarousel
          eyebrow="Cùng danh mục"
          title={`Sản phẩm khác trong "${product.category_name}"`}
          products={related}
        />
      )}

      {hot.length > 0 && (
        <ProductCarousel
          eyebrow="★ Hot"
          title="Đang được săn đón"
          products={hot}
        />
      )}
    </>
  );
}
