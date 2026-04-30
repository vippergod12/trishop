import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import loginHandler from '../api/auth/login.js';
import meHandler from '../api/auth/me.js';
import categoriesIndex from '../api/categories/index.js';
import categoryById from '../api/categories/[id].js';
import productsIndex from '../api/products/index.js';
import productsFeatured from '../api/products/featured.js';
import productsHero from '../api/products/hero.js';
import productById from '../api/products/[id].js';
import homeHandler from '../api/home.js';

type VercelLikeHandler = (req: VercelRequest, res: VercelResponse) => unknown | Promise<unknown>;

function adapt(handler: VercelLikeHandler, paramKey?: string): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const vercelReq = req as unknown as VercelRequest;
    const vercelRes = res as unknown as VercelResponse;
    const merged: Record<string, string | string[]> = { ...(req.query as Record<string, string | string[]>) };
    if (paramKey && req.params[paramKey] !== undefined) {
      merged[paramKey] = req.params[paramKey] as string;
    }
    (vercelReq as unknown as { query: Record<string, string | string[]> }).query = merged;
    try {
      await handler(vercelReq, vercelRes);
    } catch (err) {
      next(err);
    }
  };
}

const app = express();
app.use(express.json({ limit: '8mb' }));

app.post('/api/auth/login', adapt(loginHandler));
app.get('/api/auth/me', adapt(meHandler));

app.get('/api/home', adapt(homeHandler));

app.get('/api/categories', adapt(categoriesIndex));
app.post('/api/categories', adapt(categoriesIndex));
app.get('/api/categories/:id', adapt(categoryById, 'id'));
app.put('/api/categories/:id', adapt(categoryById, 'id'));
app.delete('/api/categories/:id', adapt(categoryById, 'id'));

app.get('/api/products', adapt(productsIndex));
app.post('/api/products', adapt(productsIndex));
app.get('/api/products/featured', adapt(productsFeatured));
app.put('/api/products/featured', adapt(productsFeatured));
app.get('/api/products/hero', adapt(productsHero));
app.put('/api/products/hero', adapt(productsHero));
app.get('/api/products/:id', adapt(productById, 'id'));
app.put('/api/products/:id', adapt(productById, 'id'));
app.patch('/api/products/:id', adapt(productById, 'id'));
app.delete('/api/products/:id', adapt(productById, 'id'));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err instanceof Error ? err.message : 'Server error' });
});

const port = Number(process.env.API_PORT || 3001);
app.listen(port, () => {
  console.log(`[shop] API local đang chạy tại http://localhost:${port}`);
});
