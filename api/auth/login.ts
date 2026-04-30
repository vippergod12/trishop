import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { signAdminToken } from '../_lib/auth.js';
import { badRequest, handlePreflight, methodNotAllowed } from '../_lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const body = (req.body ?? {}) as { username?: string; password?: string };
  const username = (body.username ?? '').trim();
  const password = body.password ?? '';
  if (!username || !password) return badRequest(res, 'Thiếu username hoặc password');

  const rows = (await sql`
    SELECT id, username, password_hash FROM admins WHERE username = ${username} LIMIT 1
  `) as { id: number; username: string; password_hash: string }[];

  const admin = rows[0];
  if (!admin) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

  const token = signAdminToken({ sub: admin.id, username: admin.username });
  res.status(200).json({ token, admin: { id: admin.id, username: admin.username } });
}
