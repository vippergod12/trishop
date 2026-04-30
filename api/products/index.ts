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

const DEFAULT_LIST_LIMIT = 60;
const MAX_LIST_LIMIT = 200;

function getQueryString(req: VercelRequest, key: string): string | undefined {
  const value = req.query[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of input) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;

  if (req.method === 'GET') {
    const categoryRaw = getQueryString(req, 'category');
    const search = (getQueryString(req, 'q') ?? '').trim();
    const limitRaw = getQueryString(req, 'limit');
    const limit = (() => {
      const n = Number(limitRaw);
      if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIST_LIMIT;
      return Math.min(Math.floor(n), MAX_LIST_LIMIT);
    })();

    const categoryId = categoryRaw && /^\d+$/.test(categoryRaw) ? Number(categoryRaw) : null;
    const categorySlug = categoryRaw && !categoryId ? categoryRaw : null;
    const searchTerm = search ? `%${search}%` : null;

    // Bỏ p.description khỏi list (cột text dài, không dùng cho card).
    const rows = await sql`
      SELECT p.id, p.category_id, p.name, p.slug, p.price,
             p.sale_price, p.sale_end_at,
             p.image_url, p.colors,
             p.is_active, p.is_hero, p.featured_rank,
             p.created_at, p.updated_at,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE (${categoryId}::int IS NULL OR p.category_id = ${categoryId}::int)
        AND (${categorySlug}::text IS NULL OR c.slug = ${categorySlug}::text)
        AND (${searchTerm}::text IS NULL OR p.name ILIKE ${searchTerm}::text)
      ORDER BY p.is_active DESC, p.created_at DESC
      LIMIT ${limit}
    `;
    setPublicCache(res, { sMaxAge: 60, staleWhileRevalidate: 300 });
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    setNoStore(res);
    const body = (req.body ?? {}) as {
      name?: string;
      slug?: string;
      description?: string;
      price?: number | string;
      sale_price?: number | string | null;
      sale_end_at?: string | null;
      image_url?: string;
      category_id?: number | string;
      is_active?: boolean;
      colors?: unknown;
    };
    const name = (body.name ?? '').trim();
    const categoryId = Number(body.category_id);
    const price = Number(body.price ?? 0);
    if (!name) return badRequest(res, 'Tên sản phẩm không được trống');
    if (!categoryId) return badRequest(res, 'Cần chọn danh mục');
    if (Number.isNaN(price) || price < 0) return badRequest(res, 'Giá không hợp lệ');

    const rawSalePrice = body.sale_price;
    const salePrice =
      rawSalePrice === null || rawSalePrice === undefined || rawSalePrice === ''
        ? null
        : Number(rawSalePrice);
    if (salePrice !== null && (Number.isNaN(salePrice) || salePrice < 0)) {
      return badRequest(res, 'Giá sale không hợp lệ');
    }
    const saleEndAt = body.sale_end_at ? new Date(body.sale_end_at) : null;
    if (saleEndAt && Number.isNaN(saleEndAt.getTime())) {
      return badRequest(res, 'Thời gian kết thúc sale không hợp lệ');
    }
    const saleEndIso = saleEndAt ? saleEndAt.toISOString() : null;

    const colors = parseStringArray(body.colors);
    const slug = (body.slug && body.slug.trim()) || slugify(name);
    const isActive = body.is_active ?? true;

    try {
      const rows = (await sql`
        INSERT INTO products (category_id, name, slug, description, price,
                              sale_price, sale_end_at, image_url,
                              colors, is_active)
        VALUES (${categoryId}, ${name}, ${slug}, ${body.description ?? null}, ${price},
                ${salePrice}, ${saleEndIso},
                ${body.image_url ?? null},
                ${colors}::text[], ${isActive})
        RETURNING id, category_id, name, slug, description, price,
                  sale_price, sale_end_at,
                  image_url, colors,
                  is_active, is_hero, featured_rank,
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
