import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn('[shop] DATABASE_URL chưa được cấu hình.');
}

export const sql = neon(url ?? '');
