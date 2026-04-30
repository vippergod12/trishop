import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
  const { slug = '' } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.getCategory(slug), api.listProducts({ category: slug })])
      .then(([cat, prods]) => {
        setCategory(cat);
        setProducts(prods);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container section"><div className="empty-state">Đang tải...</div></div>;
  if (error || !category)
    return (
      <div className="container section">
        <div className="empty-state">
          {error ?? 'Không tìm thấy danh mục.'}
          <div style={{ marginTop: 12 }}>
            <Link to="/" className="btn btn-ghost">Về trang chủ</Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="section">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>{category.name}</span>
        </nav>
        <div className="category-header">
          <div>
            <h1>{category.name}</h1>
            {category.description && <p>{category.description}</p>}
          </div>
          <span className="badge">{products.length} sản phẩm</span>
        </div>
        {products.length === 0 ? (
          <div className="empty-state">Chưa có sản phẩm trong danh mục này.</div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
