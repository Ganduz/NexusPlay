import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCreditCard } from 'react-icons/fa';
import useCartStore from '../store/cartStore';
import { ordersApi } from '../api/ordersApi';
import { formatPrice } from '../utils/formatters';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import '../styles/pages/CheckoutPage.css';

function CheckoutPage() {
  const { items, summary, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const { data } = await ordersApi.create();
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${data.data.id}`, { state: { order: data.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page container">
      <h1><FaLock /> Secure Checkout</h1>

      <div className="checkout-grid">
        <div className="checkout-main">
          <div className="checkout-section">
            <h3>Payment Method (Simulated)</h3>
            <div className="checkout-methods">
              {['credit_card', 'paypal', 'crypto'].map(method => (
                <label key={method} className={`checkout-method ${paymentMethod === method ? 'active' : ''}`}>
                  <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <FaCreditCard />
                  <span>{method === 'credit_card' ? 'Credit Card' : method === 'paypal' ? 'PayPal' : 'Crypto'}</span>
                </label>
              ))}
            </div>

            <div className="checkout-payment-fields animate-fadeIn">
              {paymentMethod === 'credit_card' && (
                <div className="checkout-field-group">
                  <div className="checkout-field">
                    <label>Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" />
                  </div>
                  <div className="checkout-field">
                    <label>Cardholder Name</label>
                    <input type="text" placeholder="John Doe" />
                  </div>
                  <div className="checkout-field-row">
                    <div className="checkout-field">
                      <label>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" maxLength="5" />
                    </div>
                    <div className="checkout-field">
                      <label>CVV</label>
                      <input type="text" placeholder="123" maxLength="4" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="checkout-field">
                  <label>PayPal Email</label>
                  <input type="email" placeholder="your@email.com" />
                </div>
              )}

              {paymentMethod === 'crypto' && (
                <div className="checkout-field">
                  <label>Wallet Address</label>
                  <input type="text" placeholder="0x..." />
                </div>
              )}
            </div>
          </div>

          <div className="checkout-section">
            <h3>Order Items</h3>
            {items.map((item, idx) => {
              const qty = item.quantity || 1;
              return (
              <div key={idx} className="checkout-item">
                <span className="checkout-item-name">{item.game_name}</span>
                {qty > 1 && (
                <div className="cart-item-qty">
                  <span className="cart-item-qty-badge">×{qty}</span>
                </div>
                )}
                <span className="checkout-item-meta">{item.platform_name} · {item.edition_name}</span>
                <span className="checkout-item-price">{formatPrice(item.final_price * qty)}</span>
              </div>
              )
            })}
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary-row"><span>Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
            {summary.discount > 0 && <div className="cart-summary-row cart-summary-discount"><span>Discount</span><span>-{formatPrice(summary.discount)}</span></div>}
            <div className="cart-summary-divider" />
            <div className="cart-summary-row cart-summary-total"><span>Total</span><span>{formatPrice(summary.total)}</span></div>
            <button className="cart-checkout-btn" onClick={handleCheckout} disabled={isProcessing}>
              {isProcessing ? <Loader size="sm" /> : <><FaLock /> Complete Order</>}
            </button>
            <p className="checkout-disclaimer">This is a simulated payment. No real charges.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
