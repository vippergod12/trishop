import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { PriceDisplay, SaleBadge } from './SaleBadge';

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = !product.is_active;
  return (
    <Link
      to={`/san-pham/${product.slug}`}
      className={`product-card ${soldOut ? 'is-soldout' : ''}`}
      draggable={false}
    >
      <div className="product-card-thumb">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" draggable={false} />
        ) : (
          <div className="product-card-placeholder">No image</div>
        )}
        {!soldOut && <SaleBadge product={product} />}
        {soldOut && (
          <div className="soldout-overlay">
            <span>Hết hàng</span>
          </div>
        )}
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{product.category_name ?? ''}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <PriceDisplay product={product} className="product-card-price" showEndDate />
      </div>
    </Link>
  );
}
