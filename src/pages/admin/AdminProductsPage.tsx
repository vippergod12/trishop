import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import type { Category, Product } from '../../types';
import Modal from '../../components/Modal';
import ImagePicker from '../../components/ImagePicker';
import { formatVnd } from '../../utils/format';

interface FormState {
  id?: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  price: '',
  image_url: '',
  category_id: '',
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [search, setSearch] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.listProducts({ category: filterCategory || undefined, q: search || undefined }),
        api.listCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  function openCreate() {
    setForm({ ...emptyForm, category_id: categories[0]?.id ? String(categories[0].id) : '' });
    setError(null);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: String(p.price ?? 0),
      image_url: p.image_url ?? '',
      category_id: String(p.category_id),
      is_active: p.is_active,
    });
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload: Partial<Product> = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || null,
      price: Number(form.price || 0),
      image_url: form.image_url || null,
      category_id: Number(form.category_id),
      is_active: form.is_active,
    };
    try {
      if (form.id) {
        await api.updateProduct(form.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(p: Product) {
    if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
    try {
      await api.deleteProduct(p.id);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xoá thất bại');
    }
  }

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    refresh();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Sản phẩm</h1>
          <p>Quản lý kho sản phẩm cho website.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate} disabled={categories.length === 0}>
          + Thêm sản phẩm
        </button>
      </div>

      {categories.length === 0 && (
        <div className="empty-state">Bạn cần tạo ít nhất 1 danh mục trước khi thêm sản phẩm.</div>
      )}

      <div className="toolbar">
        <form onSubmit={onSearchSubmit} className="toolbar-search">
          <input
            type="search"
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost btn-sm">Tìm</button>
        </form>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="select"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">Không có sản phẩm phù hợp.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>#</th>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="table-thumb" />
                    ) : (
                      <div className="table-thumb empty">—</div>
                    )}
                  </td>
                  <td>
                    <div className="cell-strong">{p.name}</div>
                    <code className="cell-muted">{p.slug}</code>
                  </td>
                  <td>{p.category_name ?? categoryMap.get(p.category_id)?.name ?? '—'}</td>
                  <td>{formatVnd(p.price)}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-success' : 'badge-muted'}`}>
                      {p.is_active ? 'Đang bán' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Sửa</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(p)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        title={form.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} disabled={submitting}>Huỷ</button>
            <button type="submit" form="product-form" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        <form id="product-form" className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Tên sản phẩm *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <div className="form-row">
            <label className="field">
              <span>Slug (để trống sẽ tự sinh)</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Giá (VND) *</span>
              <input
                required
                type="number"
                min={0}
                step="1000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
          </div>
          <label className="field">
            <span>Danh mục *</span>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="" disabled>Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <ImagePicker
            label="Ảnh sản phẩm"
            value={form.image_url}
            onChange={(v) => setForm({ ...form, image_url: v })}
            disabled={submitting}
          />
          <label className="field">
            <span>Mô tả</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="field-inline">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span>Hiển thị trên website</span>
          </label>
          {error && <div className="form-error">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
