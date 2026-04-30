import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL chưa được cấu hình.');
    process.exit(1);
  }

  const sql = neon(url);

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  await sql`
    INSERT INTO admins (username, password_hash)
    VALUES (${username}, ${passwordHash})
    ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;
  console.log(`Đã tạo/cập nhật admin: ${username}`);

  const categories: { name: string; slug: string; image_url: string; description: string }[] = [
    {
      name: 'Áo',
      slug: 'ao',
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop',
      description: 'Áo thun, sơ mi, blazer cho mọi dịp',
    },
    {
      name: 'Quần',
      slug: 'quan',
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop',
      description: 'Quần jeans, kaki, ống rộng',
    },
    {
      name: 'Đầm',
      slug: 'dam',
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&auto=format&fit=crop',
      description: 'Đầm dạo phố, dự tiệc',
    },
    {
      name: 'Chân váy',
      slug: 'chan-vay',
      image_url: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=900&auto=format&fit=crop',
      description: 'Chân váy A, xòe, bút chì',
    },
    {
      name: 'Giày',
      slug: 'giay',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop',
      description: 'Sneaker, boot, sandal',
    },
    {
      name: 'Túi xách',
      slug: 'tui-xach',
      image_url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900&auto=format&fit=crop',
      description: 'Túi tote, đeo chéo, cầm tay',
    },
    {
      name: 'Phụ kiện',
      slug: 'phu-kien',
      image_url: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23f?w=900&auto=format&fit=crop',
      description: 'Mũ, khăn, kính, đồng hồ',
    },
    {
      name: 'Trang sức',
      slug: 'trang-suc',
      image_url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&auto=format&fit=crop',
      description: 'Vòng cổ, hoa tai, nhẫn',
    },
  ];

  for (const c of categories) {
    await sql`
      INSERT INTO categories (name, slug, image_url, description)
      VALUES (${c.name}, ${c.slug}, ${c.image_url}, ${c.description})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  console.log(`Đã tạo ${categories.length} danh mục mẫu.`);

  const products: {
    slug: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category_slug: string;
    sale_price?: number;
    sale_end_at?: string;
  }[] = [
    // Áo
    {
      slug: 'ao-thun-basic-trang',
      name: 'Áo thun basic trắng',
      description: 'Áo thun cotton 100%, mềm mại, thoáng mát.',
      price: 199000,
      sale_price: 129000,
      sale_end_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop',
      category_slug: 'ao',
    },
    {
      slug: 'ao-so-mi-trang-cong-so',
      name: 'Áo sơ mi trắng công sở',
      description: 'Sơ mi trắng thanh lịch, form chuẩn.',
      price: 359000,
      image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop',
      category_slug: 'ao',
    },
    {
      slug: 'ao-blazer-be',
      name: 'Áo blazer be',
      description: 'Blazer dáng công sở, lịch sự sang trọng.',
      price: 899000,
      sale_price: 599000,
      sale_end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&auto=format&fit=crop',
      category_slug: 'ao',
    },
    // Quần
    {
      slug: 'quan-jeans-slim',
      name: 'Quần jeans slim',
      description: 'Quần jeans dáng slim, ôm vừa phải.',
      price: 459000,
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop',
      category_slug: 'quan',
    },
    {
      slug: 'quan-kaki-nau',
      name: 'Quần kaki nâu',
      description: 'Kaki dáng đứng, lịch sự.',
      price: 399000,
      image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b3a0334?w=900&auto=format&fit=crop',
      category_slug: 'quan',
    },
    {
      slug: 'quan-ong-rong',
      name: 'Quần ống rộng linen',
      description: 'Quần ống rộng chất linen mát mẻ.',
      price: 489000,
      image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&auto=format&fit=crop',
      category_slug: 'quan',
    },
    // Đầm
    {
      slug: 'dam-suong-trang',
      name: 'Đầm suông trắng',
      description: 'Đầm suông tinh tế cho mùa hè.',
      price: 559000,
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&auto=format&fit=crop',
      category_slug: 'dam',
    },
    {
      slug: 'dam-xoe-hoa-nhi',
      name: 'Đầm xòe hoa nhí',
      description: 'Đầm xòe nữ tính, dạo phố.',
      price: 649000,
      image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop',
      category_slug: 'dam',
    },
    // Chân váy
    {
      slug: 'chan-vay-but-chi-den',
      name: 'Chân váy bút chì đen',
      description: 'Chân váy công sở dáng bút chì.',
      price: 299000,
      image_url: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=900&auto=format&fit=crop',
      category_slug: 'chan-vay',
    },
    {
      slug: 'chan-vay-xoe-be',
      name: 'Chân váy xòe be',
      description: 'Chân váy xòe nữ tính, dáng dài.',
      price: 339000,
      image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=900&auto=format&fit=crop',
      category_slug: 'chan-vay',
    },
    // Giày
    {
      slug: 'giay-sneaker-trang',
      name: 'Giày sneaker trắng',
      description: 'Sneaker classic, dễ phối đồ.',
      price: 799000,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop',
      category_slug: 'giay',
    },
    {
      slug: 'giay-boot-da-nau',
      name: 'Giày boot da nâu',
      description: 'Boot ngắn da thật, phong cách.',
      price: 1290000,
      image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&auto=format&fit=crop',
      category_slug: 'giay',
    },
    // Túi xách
    {
      slug: 'tui-tote-canvas',
      name: 'Túi tote canvas',
      description: 'Túi tote vải canvas đơn giản, chứa nhiều đồ.',
      price: 249000,
      image_url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900&auto=format&fit=crop',
      category_slug: 'tui-xach',
    },
    {
      slug: 'tui-deo-cheo-mini',
      name: 'Túi đeo chéo mini',
      description: 'Túi đeo chéo nhỏ gọn, sang trọng.',
      price: 459000,
      image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&auto=format&fit=crop',
      category_slug: 'tui-xach',
    },
    // Phụ kiện
    {
      slug: 'mu-luoi-trai-den',
      name: 'Mũ lưỡi trai đen',
      description: 'Mũ lưỡi trai cá tính.',
      price: 159000,
      image_url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&auto=format&fit=crop',
      category_slug: 'phu-kien',
    },
    {
      slug: 'kinh-mat-vintage',
      name: 'Kính mát vintage',
      description: 'Kính mát phong cách retro.',
      price: 289000,
      image_url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=900&auto=format&fit=crop',
      category_slug: 'phu-kien',
    },
    // Trang sức
    {
      slug: 'vong-co-bac-don-gian',
      name: 'Vòng cổ bạc đơn giản',
      description: 'Vòng cổ bạc 925, thiết kế tối giản.',
      price: 359000,
      image_url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&auto=format&fit=crop',
      category_slug: 'trang-suc',
    },
    {
      slug: 'hoa-tai-ngoc-trai',
      name: 'Hoa tai ngọc trai',
      description: 'Hoa tai ngọc trai sang trọng.',
      price: 219000,
      image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&auto=format&fit=crop',
      category_slug: 'trang-suc',
    },
  ];

  for (const p of products) {
    await sql`
      INSERT INTO products (category_id, name, slug, description, price, sale_price, sale_end_at, image_url)
      SELECT c.id, ${p.name}, ${p.slug}, ${p.description}, ${p.price},
             ${p.sale_price ?? null}, ${p.sale_end_at ?? null}, ${p.image_url}
      FROM categories c
      WHERE c.slug = ${p.category_slug}
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  console.log(`Đã tạo ${products.length} sản phẩm mẫu.`);
  console.log('Seed hoàn tất.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
