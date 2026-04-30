import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';
import { getSaleInfo } from '../utils/sale';

type SortKey = 'newest' | 'price-asc' | 'price-desc';

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
];

const ALL = 'all';

function effectivePrice(p: Product): number {
  return getSaleInfo(p).effectivePrice;
}

function sortProducts(list: Product[], key: SortKey): Product[] {
  const arr = [...list];
  if (key === 'price-asc') {
    arr.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  } else if (key === 'price-desc') {
    arr.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  } else {
    arr.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
  }
  return arr;
}

export default function AllProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const cat = (searchParams.get('cat') || ALL).trim() || ALL;
  const sortRaw = (searchParams.get('sort') || 'newest') as SortKey;
  const sort: SortKey = SORT_OPTIONS.some((o) => o.value === sortRaw) ? sortRaw : 'newest';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    api
      .listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setVisible(PAGE_SIZE);
    api
      .listProducts(cat === ALL ? {} : { category: cat })
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cat]);

  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);
  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || (key === 'sort' && value === 'newest')) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  function chooseCategory(slug: string) {
    setParam('cat', slug);
  }

  function chooseSort(s: SortKey) {
    setParam('sort', s);
    setVisible(PAGE_SIZE);
  }

  function loadMore() {
    setVisible((v) => Math.min(v + PAGE_SIZE, sorted.length));
  }

  const currentCategory = categories.find((c) => c.slug === cat);

  return (
    <div className="section">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>{cat === ALL ? 'Toàn bộ sản phẩm' : currentCategory?.name ?? 'Toàn bộ sản phẩm'}</span>
        </nav>

        <div className="all-products-header">
          <div>
            <span className="section-eyebrow">Cửa hàng</span>
            <h1>{cat === ALL ? 'Toàn bộ sản phẩm' : currentCategory?.name ?? 'Toàn bộ sản phẩm'}</h1>
          </div>
          <span className="all-products-count">{sorted.length} sản phẩm</span>
        </div>

        <div className="all-products-layout">
          <aside className="all-products-sidebar" aria-label="Danh mục">
            <h3 className="sidebar-title">Danh mục</h3>
            <ul className="sidebar-list">
              <li>
                <button
                  type="button"
                  className={`sidebar-item ${cat === ALL ? 'is-active' : ''}`}
                  onClick={() => chooseCategory(ALL)}
                >
                  <span>Tất cả</span>
                  <span className="sidebar-count" aria-hidden>{categories.reduce((sum, c) => sum + (c.product_count ?? 0), 0)}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`sidebar-item ${cat === c.slug ? 'is-active' : ''}`}
                    onClick={() => chooseCategory(c.slug)}
                  >
                    <span>{c.name}</span>
                    {typeof c.product_count === 'number' && (
                      <span className="sidebar-count" aria-hidden>{c.product_count}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="all-products-main">
            <div className="all-products-toolbar">
              <span className="toolbar-info">
                Hiển thị <strong>{shown.length}</strong> / {sorted.length}
              </span>
              <div className="toolbar-sort">
                <label htmlFor="sort-select">Sắp xếp</label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={(e) => chooseSort(e.target.value as SortKey)}
                  className="select"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Đang tải...</div>
            ) : error ? (
              <div className="empty-state">{error}</div>
            ) : sorted.length === 0 ? (
              <div className="empty-state">Chưa có sản phẩm nào trong mục này.</div>
            ) : (
              <>
                <div className="product-grid all-products-grid">
                  {shown.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {hasMore && (
                  <div className="load-more-wrap">
                    <button type="button" className="btn-load-more" onClick={loadMore}>
                      Xem thêm
                      <span className="load-more-meta">
                        ({sorted.length - visible} sản phẩm)
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
