import type { VercelRequest, VercelResponse } from '@vercel/node';

export function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handlePreflight(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

/**
 * Bật CDN cache cho response GET công khai.
 *
 * Trên Vercel Edge:
 *   - `s-maxage`: thời gian cache "tươi" (giây)
 *   - `stale-while-revalidate`: trong khoảng này phục vụ phiên bản cũ ngay,
 *     đồng thời revalidate trong nền → user không bao giờ phải chờ DB
 *
 * Admin có thể bypass cache bằng cách thêm query param ngẫu nhiên (`?_=<ts>`),
 * vì Vercel CDN dùng full URL làm key.
 */
export function setPublicCache(
  res: VercelResponse,
  options: { sMaxAge?: number; staleWhileRevalidate?: number } = {},
) {
  const sMaxAge = options.sMaxAge ?? 60;
  const swr = options.staleWhileRevalidate ?? 300;
  res.setHeader(
    'Cache-Control',
    `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
  );
}

/** Đảm bảo browser/CDN không cache response (dùng cho admin / mutation). */
export function setNoStore(res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
}

export function badRequest(res: VercelResponse, message: string) {
  res.status(400).json({ message });
}

export function notFound(res: VercelResponse, message = 'Không tìm thấy') {
  res.status(404).json({ message });
}

export function methodNotAllowed(res: VercelResponse, allow: string[]) {
  res.setHeader('Allow', allow.join(', '));
  res.status(405).json({ message: 'Method not allowed' });
}

export function slugify(input: string): string {
  return input
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
