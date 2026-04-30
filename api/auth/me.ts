import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminFromRequest } from '../_lib/auth.js';
import { handlePreflight, methodNotAllowed, setNoStore } from '../_lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  setNoStore(res);
  const admin = getAdminFromRequest(req);
  if (!admin) return res.status(401).json({ message: 'Chưa đăng nhập' });
  res.status(200).json({ admin });
}
