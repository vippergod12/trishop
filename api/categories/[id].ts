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
      SELECT id, name, slug, image_url, description, created_at, updated_at
      FROM categories
      WHERE (${ident.id ?? null}::int IS NOT NULL AND id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND slug = ${ident.slug ?? null}::text)
      LIMIT 1
    `) as Record<string, unknown>[];
    if (!rows[0]) return notFound(res, 'Không tìm thấy danh mục');
    setPublicCache(res, { sMaxAge: 300, staleWhileRevalidate: 1800 });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;
    setNoStore(res);
    const body = (req.body ?? {}) as {
      name?: string;
      slug?: string;
      image_url?: string | null;
      description?: string | null;
    };
    const name = (body.name ?? '').trim();
    if (!name) return badRequest(res, 'Tên danh mục không được trống');
    const slug = (body.slug && body.slug.trim()) || slugify(name);

    const rows = (await sql`
      UPDATE categories
      SET name = ${name},
          slug = ${slug},
          image_url = ${body.image_url ?? null},
          description = ${body.description ?? null},
          updated_at = NOW()
      WHERE (${ident.id ?? null}::int IS NOT NULL AND id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND slug = ${ident.slug ?? null}::text)
      RETURNING id, name, slug, image_url, description, created_at, updated_at
    `) as Record<string, unknown>[];
    if (!rows[0]) return notFound(res, 'Không tìm thấy danh mục');
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    setNoStore(res);
    const rows = (await sql`
      DELETE FROM categories
      WHERE (${ident.id ?? null}::int IS NOT NULL AND id = ${ident.id ?? null}::int)
         OR (${ident.slug ?? null}::text IS NOT NULL AND slug = ${ident.slug ?? null}::text)
      RETURNING id
    `) as Record<string, unknown>[];
    if (!rows[0]) return notFound(res, 'Không tìm thấy danh mục');
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
}
