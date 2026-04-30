import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import {
  badRequest,
  handlePreflight,
  methodNotAllowed,
  notFound,
  setNoStore,
  setPublicCache,
  slugify,
} from '../_lib/http.js';

const RELATED_LIMIT = 12;
const FEATURED_LIMIT = 12;

function getIdentifier(req: VercelRequest): { id?: number; slug?: string } {
  const raw = req.query.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return {};
  if (/^\d+$/.test(value)) return { id: Number(value) };
  return { slug: value };
}

function parseIncludes(req: VercelRequest): { related: boolean; featured: boolean } {
  const raw = req.query.include;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return { related: false, featured: false };
  const parts = String(value).split(',').map((s) => s.trim().toLowerCase());
  return {
    related: parts.includes('related'),
    featured: parts.includes('featured'),
  };
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

function parseSale(body: { sale_price?: number | string | null; sale_end_at?: string | null }) {
  const rawPrice = body.sale_price;
  const salePrice =
    rawPrice === null || rawPrice === undefined || rawPrice === ''
      ? null
      : Number(rawPrice);
  if (salePrice !== null && (Number.isNaN(salePrice) || salePrice < 0)) {
    return { error: 'Giá sale không hợp lệ' as const };
  }
  const rawEnd = body.sale_end_at;
  const saleEndAt = rawEnd ? new Date(rawEnd) : null;
  if (saleEndAt && Number.isNaN(saleEndAt.getTime())) {
    return { error: 'Thời gian kết thúc sale không hợp lệ' as const };
  }
  return { salePrice, saleEndAt: saleEndAt ? saleEndAt.toISOString() : null, error: null };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  const ident = getIdentifier(req);
  if (!ident.id && !ident.slug) return badRequest(res, 'Thiếu id hoặc slug');

  if (req.method === 'GET') {
    const includes = parseIncludes(req);

    const rows = (await sql`
      SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price,
             p.sale_price, p.sale_end_at,
             p.image_url, p.colors,
             p.is_active, p.is_hero, p.featured_rank,
             p.created_at, p.updated_at,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE (${ident.id ?? null}::int IS NOT NULL AND p.id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND p.slug = ${ident.slug ?? null}::text)
      LIMIT 1
    `) as Record<string, unknown>[];
    const product = rows[0];
    if (!product) return notFound(res, 'Không tìm thấy sản phẩm');

    if (!includes.related && !includes.featured) {
      setPublicCache(res, { sMaxAge: 60, staleWhileRevalidate: 300 });
      return res.status(200).json(product);
    }

    // Bundled detail: chạy thêm related + featured trong cùng 1 function
    // → tiết kiệm 2 round trip cold-start so với gọi 3 endpoint riêng.
    const productId = product.id as number;
    const productCategoryId = product.category_id as number;

    const relatedPromise = includes.related
      ? sql`
          SELECT p.id, p.category_id, p.name, p.slug, p.price,
                 p.sale_price, p.sale_end_at,
                 p.image_url, p.colors,
                 p.is_active, p.is_hero, p.featured_rank,
                 p.created_at, p.updated_at,
                 c.name AS category_name, c.slug AS category_slug
          FROM products p
          JOIN categories c ON c.id = p.category_id
          WHERE p.category_id = ${productCategoryId}
            AND p.id <> ${productId}
          ORDER BY p.is_active DESC, p.created_at DESC
          LIMIT ${RELATED_LIMIT}
        `
      : Promise.resolve([] as Record<string, unknown>[]);

    const featuredPromise = includes.featured
      ? sql`
          SELECT p.id, p.category_id, p.name, p.slug, p.price,
                 p.sale_price, p.sale_end_at,
                 p.image_url, p.colors,
                 p.is_active, p.featured_rank,
                 p.created_at, p.updated_at,
                 c.name AS category_name, c.slug AS category_slug
          FROM products p
          JOIN categories c ON c.id = p.category_id
          WHERE p.featured_rank IS NOT NULL
            AND p.id <> ${productId}
          ORDER BY p.featured_rank ASC
          LIMIT ${FEATURED_LIMIT}
        `
      : Promise.resolve([] as Record<string, unknown>[]);

    const [related, featured] = await Promise.all([relatedPromise, featuredPromise]);

    setPublicCache(res, { sMaxAge: 60, staleWhileRevalidate: 300 });
    return res.status(200).json({
      product,
      related: includes.related ? related : undefined,
      featured: includes.featured ? featured : undefined,
    });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;
    setNoStore(res);
    const body = (req.body ?? {}) as {
      name?: string;
      slug?: string;
      description?: string | null;
      price?: number | string;
      sale_price?: number | string | null;
      sale_end_at?: string | null;
      image_url?: string | null;
      category_id?: number | string;
      is_active?: boolean;
      colors?: unknown;
    };

    if (req.method === 'PATCH') {
      const fields = Object.keys(body);
      if (fields.length === 1 && fields[0] === 'is_active') {
        const isActive = Boolean(body.is_active);
        const rows = (await sql`
          UPDATE products
          SET is_active = ${isActive}, updated_at = NOW()
          WHERE (${ident.id ?? null}::int IS NOT NULL AND id = ${ident.id ?? null}::int)
             OR (${ident.slug ?? null}::text IS NOT NULL AND slug = ${ident.slug ?? null}::text)
          RETURNING id, category_id, name, slug, description, price,
                    sale_price, sale_end_at,
                    image_url, colors,
                    is_active, is_hero, featured_rank,
                    created_at, updated_at
        `) as Record<string, unknown>[];
        if (!rows[0]) return notFound(res, 'Không tìm thấy sản phẩm');
        return res.status(200).json(rows[0]);
      }
      return badRequest(res, 'PATCH chỉ hỗ trợ trường is_active');
    }

    const name = (body.name ?? '').trim();
    const categoryId = Number(body.category_id);
    const price = Number(body.price ?? 0);
    if (!name) return badRequest(res, 'Tên sản phẩm không được trống');
    if (!categoryId) return badRequest(res, 'Cần chọn danh mục');
    if (Number.isNaN(price) || price < 0) return badRequest(res, 'Giá không hợp lệ');
    const sale = parseSale(body);
    if (sale.error) return badRequest(res, sale.error);
    const colors = parseStringArray(body.colors);
    const slug = (body.slug && body.slug.trim()) || slugify(name);
    const isActive = body.is_active ?? true;

    const rows = (await sql`
      UPDATE products
      SET category_id = ${categoryId},
          name = ${name},
          slug = ${slug},
          description = ${body.description ?? null},
          price = ${price},
          sale_price = ${sale.salePrice},
          sale_end_at = ${sale.saleEndAt},
          image_url = ${body.image_url ?? null},
          colors = ${colors}::text[],
          is_active = ${isActive},
          updated_at = NOW()
      WHERE (${ident.id ?? null}::int IS NOT NULL AND id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND slug = ${ident.slug ?? null}::text)
      RETURNING id, category_id, name, slug, description, price,
                sale_price, sale_end_at,
                image_url, colors,
                is_active, is_hero, featured_rank,
                created_at, updated_at
    `) as Record<string, unknown>[];
    if (!rows[0]) return notFound(res, 'Không tìm thấy sản phẩm');
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    setNoStore(res);
    const rows = (await sql`
      DELETE FROM products
      WHERE (${ident.id ?? null}::int IS NOT NULL AND id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND slug = ${ident.slug ?? null}::text)
      RETURNING id
    `) as Record<string, unknown>[];
    if (!rows[0]) return notFound(res, 'Không tìm thấy sản phẩm');
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['GET', 'PUT', 'PATCH', 'DELETE']);
}
