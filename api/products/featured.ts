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

const MAX_FEATURED = 12;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT p.id, p.category_id, p.name, p.slug, p.price,
             p.sale_price, p.sale_end_at,
             p.image_url, p.colors,
             p.is_active, p.featured_rank,
             p.created_at, p.updated_at,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.featured_rank IS NOT NULL
      ORDER BY p.featured_rank ASC
      LIMIT ${MAX_FEATURED}
    `;
    setPublicCache(res, { sMaxAge: 120, staleWhileRevalidate: 600 });
    return res.status(200).json(rows);
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;
    setNoStore(res);
    const body = (req.body ?? {}) as { ids?: unknown };
    const rawIds = Array.isArray(body.ids) ? body.ids : [];

    const ids: number[] = [];
    const seen = new Set<number>();
    for (const v of rawIds) {
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) continue;
      if (seen.has(n)) continue;
      seen.add(n);
      ids.push(n);
      if (ids.length >= MAX_FEATURED) break;
    }

    if (ids.length === 0) {
      await sql`UPDATE products SET featured_rank = NULL WHERE featured_rank IS NOT NULL`;
      return res.status(200).json({ count: 0, ids: [] });
    }

    const existing = (await sql`
      SELECT id FROM products WHERE id = ANY(${ids}::int[])
    `) as { id: number }[];
    const validSet = new Set(existing.map((r) => r.id));
    const finalIds = ids.filter((id) => validSet.has(id));

    if (finalIds.length === 0) {
      return badRequest(res, 'Không có sản phẩm hợp lệ nào trong danh sách');
    }

    await sql`
      UPDATE products SET featured_rank = NULL
      WHERE featured_rank IS NOT NULL
        AND id <> ALL(${finalIds}::int[])
    `;

    for (let i = 0; i < finalIds.length; i++) {
      const id = finalIds[i];
      const rank = i + 1;
      await sql`UPDATE products SET featured_rank = ${rank} WHERE id = ${id}`;
    }

    return res.status(200).json({ count: finalIds.length, ids: finalIds });
  }

  return methodNotAllowed(res, ['GET', 'PUT']);
}
