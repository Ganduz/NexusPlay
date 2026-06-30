import PriceDisplay from '../common/PriceDisplay';
import '../../styles/components/game/EditionSelector.css';

function EditionSelector({ editions = [], selected, onSelect }) {
  return (
    <div className="edition-selector">
      <label className="edition-selector-label">Edition</label>
      <div className="edition-options">
        {editions.map((ed) => (
          <button
            key={ed.id}
            className={`edition-option ${selected === ed.id ? 'edition-option-active' : ''}`}
            onClick={() => onSelect(ed.id)}
          >
            <span className="edition-name">{ed.edition_name}</span>
            <PriceDisplay
              basePrice={ed.base_price}
              finalPrice={ed.final_price}
              discountPercent={ed.discount_percent}
              size="sm"
            />
            {ed.stock_status === 'preorder' && (
              <span className="badge badge-preorder">Pre-order</span>
            )}
            {ed.stock_status === 'out_of_stock' && (
              <span className="edition-oos">Out of stock</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EditionSelector;
