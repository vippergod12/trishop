import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { badRequest, handlePreflight, methodNotAllowed, slugify } from '../_lib/http.js';

function getQueryString(req: VercelRequest, key: string): string | undefined {
  const value = req.query[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'GET') {
    const categoryRaw = getQueryString(req, 'category');
    const search = (getQueryString(req, 'q') ?? '').trim();

    const categoryId = categoryRaw && /^\d+$/.test(categoryRaw) ? Number(categoryRaw) : null;
    const categorySlug = categoryRaw && !categoryId ? categoryRaw : null;
    const searchTerm = search ? `%${search}%` : null;

    const rows = await sql`
      SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price, p.image_url, p.is_active,
             p.created_at, p.updated_at,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = TRUE
        AND (${categoryId}::int IS NULL OR p.category_id = ${categoryId}::int)
        AND (${categorySlug}::text IS NULL OR c.slug = ${categorySlug}::text)
        AND (${searchTerm}::text IS NULL OR p.name ILIKE ${searchTerm}::text)
      ORDER BY p.created_at DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    const body = (req.body ?? {}) as {
      name?: string;
      slug?: string;
      description?: string;
      price?: number | string;
      image_url?: string;
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

    try {
      const rows = (await sql`
        INSERT INTO products (category_id, name, slug, description, price, image_url, is_active)
        VALUES (${categoryId}, ${name}, ${slug}, ${body.description ?? null}, ${price},
                ${body.image_url ?? null}, ${isActive})
        RETURNING id, category_id, name, slug, description, price, image_url, is_active,
                  created_at, updated_at
      `) as Record<string, unknown>[];
      return res.status(201).json(rows[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      if (msg.includes('duplicate')) return res.status(409).json({ message: 'Slug đã tồn tại' });
      if (msg.includes('foreign key')) return res.status(400).json({ message: 'Danh mục không tồn tại' });
      return res.status(500).json({ message: msg });
    }
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
