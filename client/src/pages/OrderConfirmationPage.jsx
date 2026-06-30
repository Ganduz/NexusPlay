import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaKey, FaGamepad, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ordersApi } from '../api/ordersApi';
import { formatPrice } from '../utils/formatters';
import Loader from '../components/common/Loader';
import '../styles/pages/OrderConfirmationPage.css';

function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [isLoading, setIsLoading] = useState(!order);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    if (!order) {
      ordersApi.getById(id).then(({ data }) => { setOrder(data.data); setIsLoading(false); }).catch(() => setIsLoading(false));
    }
  }, [id, order]);

  if (isLoading) return <div className="loading-page"><Loader size="lg" /></div>;
  if (!order) return <div className="loading-page"><p>Order not found</p></div>;

  return (
    <div className="order-confirm-page container">
      <div className="order-confirm-header animate-fadeInUp">
        <FaCheckCircle className="order-confirm-icon" />
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been processed.</p>
        <span className="order-confirm-number">Order #{order.order_number}</span>
      </div>

      <div className="order-confirm-items">
        <div className="order-confirm-items-header">
          <h3>Your Games</h3>
          <button className="order-confirm-toggle" onClick={() => setShowKeys(k => !k)}>
            {showKeys ? <><FaEyeSlash /> Hide Keys</> : <><FaEye /> Show Keys</>}
          </button>
        </div>
        {(order.items || []).map((item, idx) => {
          const qty = item.quantity || 1;
          const keys = (item.serial_key || '').split('|');
          return (
          <div key={idx} className="order-confirm-item">
            <div className="order-confirm-item-info">
              <span className="order-confirm-item-name">{item.game_name}</span>
              <span className="order-confirm-item-meta">{item.platform_name} · {item.edition_name}</span>
            </div>
            {qty > 1 && (
              <div className="order-confirm-item-qty">
                <span className="order-confirm-item-qty-badge">×{qty}</span>
              </div>
            )}
            <div className="order-confirm-item-keys">
              {keys.map((key, ki) => (
                <div key={ki} className={`order-confirm-item-key ${showKeys ? '' : 'masked'}`}>
                  <FaKey /> <code>{showKeys ? key : '••••••••••••••••'}</code>
                </div>
              ))}
            </div>
            <span className="order-confirm-item-price">{formatPrice(item.final_price * qty)}</span>
          </div>
          );
        })}
      </div>

      <div className="order-confirm-total">
        <span>Total Paid</span>
        <span>{formatPrice(order.total)}</span>
      </div>

      <div className="order-confirm-actions">
        <Link to="/profile/library" className="order-confirm-btn"><FaGamepad /> Go to Library</Link>
        <Link to="/" className="order-confirm-btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
