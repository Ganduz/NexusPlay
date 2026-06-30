import { formatPrice } from '../../utils/formatters';
import '../../styles/components/common/PriceDisplay.css';

function PriceDisplay({ basePrice, finalPrice, discountPercent, size = 'md' }) {
  const hasDiscount = discountPercent > 0;

  return (
    <div className={`price-display price-${size}`}>
      {hasDiscount && (
        <span className="price-discount-badge">-{discountPercent}%</span>
      )}
      <div className="price-values">
        {hasDiscount && (
          <span className="price-old">{formatPrice(basePrice)}</span>
        )}
        <span className="price-current">{formatPrice(finalPrice)}</span>
      </div>
    </div>
  );
}

export default PriceDisplay;
