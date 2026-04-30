import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import {
  badRequest,
  handlePreflight,
  methodNotAllowed,
  setNoStore,
  setPublicCache,
  slugify,
} from '../_lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'GET') {
    // Subquery trên idx_products_category nhanh hơn LEFT JOIN + GROUP BY
    // khi số sản phẩm tăng dần.
    const rows = await sql`
      SELECT c.id, c.name, c.slug, c.image_url, c.description, c.created_at, c.updated_at,
             (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id) AS product_count
      FROM categories c
      ORDER BY c.name ASC
    `;
    setPublicCache(res, { sMaxAge: 300, staleWhileRevalidate: 1800 });
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    setNoStore(res);
    const body = (req.body ?? {}) as {
      name?: string;
      slug?: string;
      image_url?: string;
      description?: string;
    };
    const name = (body.name ?? '').trim();
    if (!name) return badRequest(res, 'Tên danh mục không được trống');
    const slug = (body.slug && body.slug.trim()) || slugify(name);
    const image_url = body.image_url ?? null;
    const description = body.description ?? null;

    try {
      const rows = (await sql`
        INSERT INTO categories (name, slug, image_url, description)
        VALUES (${name}, ${slug}, ${image_url}, ${description})
        RETURNING id, name, slug, image_url, description, created_at, updated_at
      `) as Record<string, unknown>[];
      return res.status(201).json(rows[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      if (msg.includes('duplicate')) return res.status(409).json({ message: 'Slug đã tồn tại' });
      return res.status(500).json({ message: msg });
    }
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
