import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatVnd } from '../utils/format';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/san-pham/${product.slug}`} className="product-card">
      <div className="product-card-thumb">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">No image</div>
        )}
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{product.category_name ?? ''}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <span className="product-card-price">{formatVnd(product.price)}</span>
      </div>
    </Link>
  );
}
