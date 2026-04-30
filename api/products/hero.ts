import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import {
  badRequest,
  handlePreflight,
  methodNotAllowed,
  setNoStore,
  setPublicCache,
} from '../_lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'GET') {
    const rows = (await sql`
      SELECT p.id, p.category_id, p.name, p.slug, p.price,
             p.sale_price, p.sale_end_at,
             p.image_url, p.colors,
             p.is_active, p.is_hero, p.featured_rank,
             p.created_at, p.updated_at,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_hero = TRUE
      LIMIT 1
    `) as Record<string, unknown>[];
    setPublicCache(res, { sMaxAge: 300, staleWhileRevalidate: 1800 });
    return res.status(200).json(rows[0] ?? null);
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;
    setNoStore(res);
    const body = (req.body ?? {}) as { id?: number | string | null };
    const raw = body.id;
    const id = raw === null || raw === undefined || raw === '' ? null : Number(raw);

    if (id === null) {
      await sql`UPDATE products SET is_hero = FALSE WHERE is_hero = TRUE`;
      return res.status(200).json(null);
    }

    if (!Number.isFinite(id) || id <= 0) {
      return badRequest(res, 'ID không hợp lệ');
    }

    const exist = (await sql`
      SELECT id FROM products WHERE id = ${id} LIMIT 1
    `) as { id: number }[];
    if (exist.length === 0) {
      return badRequest(res, 'Sản phẩm không tồn tại');
    }

    await sql`UPDATE products SET is_hero = FALSE WHERE is_hero = TRUE AND id <> ${id}`;
    await sql`UPDATE products SET is_hero = TRUE WHERE id = ${id}`;

    const rows = (await sql`
      SELECT p.id, p.category_id, p.name, p.slug, p.price,
             p.sale_price, p.sale_end_at,
             p.image_url, p.colors,
             p.is_active, p.is_hero, p.featured_rank,
             p.created_at, p.updated_at,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = ${id}
      LIMIT 1
    `) as Record<string, unknown>[];
    return res.status(200).json(rows[0] ?? null);
  }

  return methodNotAllowed(res, ['GET', 'PUT']);
}
