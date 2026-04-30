import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_TTL = '7d';

export interface AdminPayload {
  sub: number;
  username: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);
    if (typeof decoded === 'object' && decoded && 'sub' in decoded && 'username' in decoded) {
      return { sub: Number((decoded as jwt.JwtPayload).sub), username: String((decoded as jwt.JwtPayload).username) };
    }
    return null;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(req: VercelRequest): AdminPayload | null {
  const header = req.headers.authorization || req.headers.Authorization;
  const value = Array.isArray(header) ? header[0] : header;
  if (!value || !value.toLowerCase().startsWith('bearer ')) return null;
  return verifyAdminToken(value.slice(7).trim());
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): AdminPayload | null {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    res.status(401).json({ message: 'Cần đăng nhập admin' });
    return null;
  }
  return admin;
}
