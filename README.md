# TriShop — Next.js + Node + Neon, deploy Vercel

Một dự án demo CRUD sản phẩm theo danh mục với SEO tối đa:

- Frontend: **Next.js 14 (App Router)** + TypeScript + ISR 60s
- Backend: NodeJS Vercel Serverless Functions (thư mục `api/` ở root)
- Database: Neon (Postgres serverless) qua `@neondatabase/serverless`
- SEO: SSR/ISR cho mọi trang public, Metadata API per-page, JSON-LD, sitemap động
- Deploy: 1-click trên Vercel
- Không có giỏ hàng / thanh toán / đăng ký user. Chỉ có **một tài khoản admin** để thêm/sửa/xoá sản phẩm.

## Cấu trúc

```
trishop/
├── api/                    # Vercel Serverless Functions (giữ pattern cũ)
│   ├── _lib/               # db, auth (JWT), http helpers
│   ├── auth/               # /api/auth/login, /api/auth/me
│   ├── categories/         # CRUD danh mục
│   ├── products/           # CRUD sản phẩm + featured + hero
│   ├── home.ts             # Bundle data trang chủ (1 request)
│   └── _warm.ts            # Cron warm-up Neon DB
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (font, metadata, providers)
│   ├── globals.css         # CSS toàn cục
│   ├── providers.tsx       # AuthProvider client wrapper
│   ├── (public)/           # Layout có Navbar + Footer + Floating
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Trang chủ (Server Component, ISR 60s)
│   │   ├── cua-hang/       # Cửa hàng (server + client filters)
│   │   ├── danh-muc/[slug]/page.tsx
│   │   └── san-pham/[slug]/
│   │       ├── page.tsx    # Server với generateMetadata + JSON-LD
│   │       └── ProductDetailCta.tsx  # Client (chọn màu, Zalo)
│   ├── admin/              # Admin panel ('use client', JWT localStorage)
│   ├── sitemap.ts          # Sitemap động từ DB → /sitemap.xml
│   ├── robots.ts           # → /robots.txt
│   └── not-found.tsx
├── components/             # React components dùng chung
│   ├── home/               # Hero, Bento, Trending, Strip…
│   └── *.tsx               # Navbar, Footer, ProductCard, Modal…
├── lib/
│   ├── data.ts             # Server-side fetcher (ISR-aware)
│   ├── api-client.ts       # Client-side API wrapper (admin)
│   ├── seo/                # siteConfig + JSON-LD helpers
│   ├── contexts/           # AuthContext
│   ├── hooks/              # useInView
│   ├── utils/              # format, sale, zalo, image
│   └── types.ts
├── db/schema.sql           # Schema Postgres
├── scripts/                # init-db, seed
├── public/favicon.svg
├── next.config.mjs
├── vercel.json
└── package.json
```

## Yêu cầu

- Node.js >= 18
- Tài khoản Neon (https://console.neon.tech) — miễn phí

## Cài đặt

```bash
npm install
cp .env.example .env
```

Mở `.env` và điền:

- `DATABASE_URL`: lấy từ Neon Console → Project → Connection string (chọn _Pooled connection_, dạng `postgresql://...?sslmode=require`).
- `JWT_SECRET`: chuỗi ngẫu nhiên, ví dụ `openssl rand -hex 32` hoặc bất kỳ string dài nào.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`: tài khoản admin sẽ được seed.

## Khởi tạo database

```bash
npm run db:init     # tạo bảng (categories, products, admins)
npm run db:seed     # tạo tài khoản admin + 3 danh mục + 6 sản phẩm mẫu
```

> Cả hai script có thể chạy lại nhiều lần: `db:init` dùng `IF NOT EXISTS`, `db:seed` dùng `ON CONFLICT DO ...`.

## Chạy local

```bash
npm run dev
```

- Frontend + API: http://localhost:3000
- Next.js dev server tự build cả page lẫn `/api/*` Vercel functions trong cùng port.

Mở http://localhost:3000 → bấm **Đăng nhập admin** (`/admin/login`) bằng `ADMIN_USERNAME` / `ADMIN_PASSWORD` đã đặt trong `.env`.

## Deploy lên Vercel

1. Đẩy code lên GitHub.
2. Vào https://vercel.com → **Add New Project** → import repo.
3. Vercel tự nhận diện Next.js (Framework Preset: **Next.js**, Build Command: `next build`).
4. Mở **Settings → Environment Variables**, thêm:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (ví dụ `https://trishop.vn`) — quan trọng cho SEO + sitemap
   - `NEXT_PUBLIC_ZALO_PHONE` hoặc `NEXT_PUBLIC_ZALO_URL`
5. Bấm **Deploy**.

Sau khi deploy lần đầu:

- Chạy `npm run db:init && npm run db:seed` từ máy local (vì có `DATABASE_URL` Neon, lệnh sẽ tác động lên DB production luôn).
- Hoặc chạy 2 script đó từ một CI/script khác — kết quả như nhau.

> Vercel tự động biên dịch các file trong `api/` thành Serverless Functions. Mỗi file `api/foo/bar.ts` tương ứng với endpoint `/api/foo/bar`. File `[id].ts` là dynamic route.

## API Endpoints

| Method | Path                         | Auth  | Mô tả                                                       |
| ------ | ---------------------------- | ----- | ----------------------------------------------------------- |
| POST   | `/api/auth/login`            | —     | Đăng nhập admin, trả về JWT                                 |
| GET    | `/api/auth/me`               | Admin | Trả về thông tin admin từ token                             |
| GET    | `/api/categories`            | —     | Danh sách danh mục (kèm `product_count`)                    |
| POST   | `/api/categories`            | Admin | Tạo danh mục                                                |
| GET    | `/api/categories/:id`        | —     | Lấy 1 danh mục (chấp nhận id hoặc slug)                     |
| PUT    | `/api/categories/:id`        | Admin | Cập nhật danh mục                                           |
| DELETE | `/api/categories/:id`        | Admin | Xoá danh mục (cascade xoá sản phẩm)                         |
| GET    | `/api/products?category=&q=` | —     | Danh sách sản phẩm. `category` nhận id hoặc slug; `q` search theo tên |
| POST   | `/api/products`              | Admin | Tạo sản phẩm                                                |
| GET    | `/api/products/:id`          | —     | Lấy 1 sản phẩm                                              |
| PUT    | `/api/products/:id`          | Admin | Cập nhật sản phẩm                                           |
| DELETE | `/api/products/:id`          | Admin | Xoá sản phẩm                                                |

Auth: gửi header `Authorization: Bearer <token>` (frontend tự lưu token trong `localStorage`).

## Tuỳ biến

- Thêm trường vào sản phẩm: chỉnh `db/schema.sql`, thêm cột; sau đó cập nhật type ở `lib/types.ts`, form admin ở `app/admin/products/page.tsx`, và các API route trong `api/products/*.ts`.
- Đổi UI/màu sắc: chỉnh biến CSS ở đầu `app/globals.css`.
- Đổi tần suất ISR (cache server-rendered): đổi `export const revalidate = 60` ở mỗi `app/(public)/.../page.tsx`.
- Thêm admin khác: chạy thẳng SQL trên Neon `INSERT INTO admins (username, password_hash) VALUES ('alice', '<bcrypt hash>')`. Có thể tạo hash bằng:

  ```bash
  node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" 'mật_khẩu_của_bạn'
  ```

## Bản quyền

Dự án mẫu, dùng tự do.
