import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { badRequest, handlePreflight, methodNotAllowed, notFound, slugify } from '../_lib/http.js';

function getIdentifier(req: VercelRequest): { id?: number; slug?: string } {
  const raw = req.query.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return {};
  if (/^\d+$/.test(value)) return { id: Number(value) };
  return { slug: value };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  const ident = getIdentifier(req);
  if (!ident.id && !ident.slug) return badRequest(res, 'Thiếu id hoặc slug');

  if (req.method === 'GET') {
    const rows = (await sql`
      SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price, p.image_url, p.is_active,
             p.created_at, p.updated_at,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE (${ident.id ?? null}::int IS NOT NULL AND p.id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND p.slug = ${ident.slug ?? null}::text)
      LIMIT 1
    `) as Record<string, unknown>[];
    if (!rows[0]) return notFound(res, 'Không tìm thấy sản phẩm');
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;
    const body = (req.body ?? {}) as {
      name?: string;
      slug?: string;
      description?: string | null;
      price?: number | string;
      image_url?: string | null;
      category_id?: number | string;
      is_active?: boolean;
    };
    const name = (body.name ?? '').trim();
    const categoryId = Number(body.category_id);
    const price = Number(body.price ?? 0);
    if (!name) return badRequest(res, 'Tên sản phẩm không được trống');
    if (!categoryId) return badRequest(res, 'Cần chọn danh mục');
    if (Number.isNaN(price) || price < 0) return badRequest(res, 'Giá không hợp lệ');
    const slug = (body.slug && body.slug.trim()) || slugify(name);
    const isActive = body.is_active ?? true;

    const rows = (await sql`
      UPDATE products
      SET category_id = ${categoryId},
          name = ${name},
          slug = ${slug},
          description = ${body.description ?? null},
          price = ${price},
          image_url = ${body.image_url ?? null},
          is_active = ${isActive},
          updated_at = NOW()
      WHERE (${ident.id ?? null}::int IS NOT NULL AND id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND slug = ${ident.slug ?? null}::text)
      RETURNING id, category_id, name, slug, description, price, image_url, is_active,
                created_at, updated_at
    `) as Record<string, unknown>[];
    if (!rows[0]) return notFound(res, 'Không tìm thấy sản phẩm');
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    const rows = (await sql`
      DELETE FROM products
      WHERE (${ident.id ?? null}::int IS NOT NULL AND id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND slug = ${ident.slug ?? null}::text)
      RETURNING id
    `) as Record<string, unknown>[];
    if (!rows[0]) return notFound(res, 'Không tìm thấy sản phẩm');
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
}
