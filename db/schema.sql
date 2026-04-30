-- Schema cho Shop (Neon Postgres)

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(160) NOT NULL UNIQUE,
  image_url   TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  slug          VARCHAR(220) NOT NULL UNIQUE,
  description   TEXT,
  price         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sale_price    NUMERIC(12, 2),
  sale_end_at   TIMESTAMPTZ,
  image_url     TEXT,
  colors        TEXT[] NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_hero       BOOLEAN NOT NULL DEFAULT FALSE,
  featured_rank INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price    NUMERIC(12, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_end_at   TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_rank INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hero       BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors        TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE products DROP COLUMN IF EXISTS stock;
ALTER TABLE products DROP COLUMN IF EXISTS sizes;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured_rank) WHERE featured_rank IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_hero ON products(is_hero) WHERE is_hero = TRUE;

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
