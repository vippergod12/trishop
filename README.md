# Shop — React + Node + Neon, deploy Vercel

Một dự án demo CRUD sản phẩm theo danh mục:

- Frontend: ReactJS (Vite + TypeScript + React Router)
- Backend: NodeJS (Vercel Serverless Functions trong thư mục `api/`)
- Database: Neon (Postgres serverless) qua `@neondatabase/serverless`
- Deploy: 1-click trên Vercel
- Không có giỏ hàng / thanh toán / đăng ký user. Chỉ có **một tài khoản admin** để thêm/sửa/xoá sản phẩm.

## Cấu trúc

```
shop/
├── api/                    # Backend (Vercel Serverless Functions)
│   ├── _lib/               # db, auth (JWT), http helpers
│   ├── auth/               # POST /api/auth/login, GET /api/auth/me
│   ├── categories/         # GET/POST /api/categories, GET/PUT/DELETE /api/categories/[id|slug]
│   └── products/           # GET/POST /api/products, GET/PUT/DELETE /api/products/[id|slug]
├── db/schema.sql           # Schema Postgres
├── scripts/
│   ├── init-db.ts          # Tạo bảng trên Neon
│   └── seed.ts             # Tạo admin + dữ liệu mẫu
├── server/local.ts         # Express bọc các handler để chạy local
├── src/                    # Frontend React
│   ├── components/         # Layout, Navbar, Footer, ProductCard, Modal
│   ├── contexts/           # AuthContext (admin token)
│   ├── pages/              # HomePage, CategoryPage, ProductDetailPage
│   │   └── admin/          # LoginPage, AdminLayout, CategoriesPage, ProductsPage
│   ├── services/api.ts     # API client (fetch wrapper)
│   ├── styles/index.css    # CSS toàn cục
│   ├── types/              # Type definitions
│   └── utils/format.ts     # Formatter (VND, ngày)
├── vercel.json             # Rewrite SPA fallback
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

- Frontend: http://localhost:5173
- API local: http://localhost:3001 (Vite tự proxy `/api` về đây)

Mở http://localhost:5173 → bấm **Admin** để đăng nhập bằng `ADMIN_USERNAME` / `ADMIN_PASSWORD` đã đặt trong `.env`.

## Deploy lên Vercel

1. Đẩy code lên GitHub.
2. Vào https://vercel.com → **Add New Project** → import repo.
3. Vercel tự nhận diện Vite (Framework Preset: **Vite**, Build Command: `npm run build`, Output: `dist`).
4. Mở **Settings → Environment Variables**, thêm:
   - `DATABASE_URL`
   - `JWT_SECRET`
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

- Thêm trường vào sản phẩm: chỉnh `db/schema.sql`, thêm cột; sau đó cập nhật type ở `src/types/index.ts`, form admin ở `src/pages/admin/AdminProductsPage.tsx`, và các API route trong `api/products/*.ts`.
- Đổi UI/màu sắc: chỉnh biến CSS ở đầu `src/styles/index.css`.
- Thêm admin khác: chạy thẳng SQL trên Neon `INSERT INTO admins (username, password_hash) VALUES ('alice', '<bcrypt hash>')`. Có thể tạo hash bằng:

  ```bash
  node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" 'mật_khẩu_của_bạn'
  ```

## Bản quyền

Dự án mẫu, dùng tự do.
