import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Product } from '../types';
import { formatVnd } from '../utils/format';

export default function ProductDetailPage() {
  const { slug = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getProduct(slug)
      .then(setProduct)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container section"><div className="empty-state">Đang tải...</div></div>;
  if (error || !product)
    return (
      <div className="container section">
        <div className="empty-state">{error ?? 'Không tìm thấy sản phẩm.'}</div>
      </div>
    );

  return (
    <div className="section">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to={`/danh-muc/${product.category_slug ?? ''}`}>{product.category_name}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail">
          <div className="product-detail-media">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} />
            ) : (
              <div className="product-card-placeholder">No image</div>
            )}
          </div>
          <div className="product-detail-info">
            <h1>{product.name}</h1>
            <div className="product-detail-price">{formatVnd(product.price)}</div>
            <p className="product-detail-description">
              {product.description || 'Chưa có mô tả cho sản phẩm này.'}
            </p>
            <div className="product-detail-meta">
              <div>
                <span className="meta-label">Danh mục</span>
                <span>{product.category_name}</span>
              </div>
              <div>
                <span className="meta-label">Mã sản phẩm</span>
                <span>#{product.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
