import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowRight, FaShoppingCart } from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import PriceDisplay from '../components/common/PriceDisplay';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import { formatPrice } from '../utils/formatters';
import { getPlaceholderImage } from '../utils/helpers';
import toast from 'react-hot-toast';
import '../styles/pages/CartPage.css';

function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { items, summary, isLoading, removeItem, removeFromLocalCart, loadCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) loadCart();
    else {
      const localCart = useCartStore.getState().getLocalCart();
      useCartStore.setState({ items: localCart, summary: {
        item_count: localCart.length,
        subtotal: localCart.reduce((s, i) => s + (parseFloat(i.base_price) || 0), 0),
        discount: localCart.reduce((s, i) => s + ((parseFloat(i.base_price) || 0) - (parseFloat(i.final_price) || 0)), 0),
        total: localCart.reduce((s, i) => s + (parseFloat(i.final_price) || 0), 0),
      }});
    }
  }, [isAuthenticated]);

  const handleRemove = async (item) => {
    try {
      if (isAuthenticated) { await removeItem(item.id); }
      else { removeFromLocalCart(item.game_platform_id); }
      toast.success('Item removed');
    } catch { toast.error('Failed to remove item'); }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) return <div className="loading-page"><Loader size="lg" /></div>;

  return (
    <div className="cart-page container">
      <h1 className="cart-page-title"><FaShoppingCart /> Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState title="Your cart is empty" message="Browse our collection and find your next favorite game" actionText="Browse Games" actionLink="/search" />
      ) : (
        <div className="cart-grid">
          <div className="cart-items">
            {items.map((item, idx) => {
              const qty = item.quantity || 1;
              return (
              <div key={item.id || item.game_platform_id || idx} className="cart-item animate-fadeIn">
                <Link to={`/game/${item.game_slug}`} className="cart-item-image">
                  <img src={item.background_image || getPlaceholderImage(120, 68)} alt={item.game_name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/game/${item.game_slug}`} className="cart-item-name">{item.game_name}</Link>
                  <div className="cart-item-meta">
                    <span>{item.platform_name}</span>
                    <span>·</span>
                    <span>{item.edition_name}</span>
                  </div>
                </div>
                {qty > 1 && (
                <div className="cart-item-qty">
                  <span className="cart-item-qty-badge">×{qty}</span>
                </div>
                )}
                <div className="cart-item-price">
                  <PriceDisplay basePrice={item.base_price * qty} finalPrice={item.final_price * qty} discountPercent={item.discount_percent} size="sm" />
                </div>
                <button className="cart-item-remove" onClick={() => handleRemove(item)} title="Remove"><FaTrash /></button>
              </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary-row"><span>Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
            {summary.discount > 0 && <div className="cart-summary-row cart-summary-discount"><span>Discount</span><span>-{formatPrice(summary.discount)}</span></div>}
            <div className="cart-summary-divider" />
            <div className="cart-summary-row cart-summary-total"><span>Total</span><span>{formatPrice(summary.total)}</span></div>
            <button className="cart-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
