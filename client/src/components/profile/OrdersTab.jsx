import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChevronDown,
  FaChevronUp,
  FaKey,
  FaCopy,
  FaCheck,
  FaBoxOpen,
} from 'react-icons/fa';
import { ordersApi } from '../../api/ordersApi';
import { formatPrice, formatDate } from '../../utils/formatters';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';
import '../../styles/components/profile/OrdersTab.css';

function OrdersTab() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: res } = await ordersApi.getAll({ page, limit: 10 });
      setData(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleToggleExpand = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    // Fetch full order details if not already cached
    if (!orderDetails[orderId]) {
      try {
        const { data: res } = await ordersApi.getById(orderId);
        setOrderDetails((prev) => ({ ...prev, [orderId]: res.data }));
      } catch {
        toast.error('Failed to load order details');
        setExpandedOrder(null);
      }
    }
  };

  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast.success('Serial key copied!');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '✕';
      default:
        return '•';
    }
  };

  if (isLoading && !data) return <Loader text="Loading orders..." />;

  if (data && (!data.orders || data.orders.length === 0)) {
    return (
      <EmptyState
        icon={<FaBoxOpen size={48} />}
        title="No orders yet"
        message="Your order history will appear here once you make a purchase."
        actionText="Browse Games"
        actionLink="/search"
      />
    );
  }

  return (
    <div className="orders animate-fadeInUp">
      <div className="orders-list">
        {data?.orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const details = orderDetails[order.id];
          const itemCount = order.item_count || order.items?.length || 0;

          return (
            <div
              key={order.id}
              className={`orders-card ${isExpanded ? 'orders-card-expanded' : ''}`}
            >
              {/* Order Header (always visible) */}
              <button
                className="orders-card-header"
                onClick={() => handleToggleExpand(order.id)}
                aria-expanded={isExpanded}
              >
                <div className="orders-card-left">
                  <span className="orders-card-number">{order.order_number}</span>
                  <span className="orders-card-date">{formatDate(order.created_at)}</span>
                </div>

                <div className="orders-card-center">
                  <span className={`orders-status orders-status-${order.status}`}>
                    <span className="orders-status-dot">{getStatusIcon(order.status)}</span>
                    {order.status}
                  </span>
                  {itemCount > 0 && (
                    <span className="orders-card-items">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>

                <div className="orders-card-right">
                  <span className="orders-card-total">{formatPrice(order.total)}</span>
                  <span className="orders-card-chevron">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="orders-card-body">
                  {!details ? (
                    <div className="orders-card-loading">
                      <Loader size="sm" />
                    </div>
                  ) : (
                    <div className="orders-items">
                      {details.items?.map((item, idx) => {
                        const qty = item.quantity || 1;
                        const keys = (item.serial_key || '').split('|');
                        return (
                        <div key={idx} className="orders-item">
                          <div className="orders-item-info">
                            <Link
                              to={`/game/${item.game_slug}`}
                              className="orders-item-name"
                            >
                              {item.game_name}
                            </Link>
                            <span className="orders-item-meta">
                              {item.platform_name}
                              {item.edition_name && ` · ${item.edition_name}`}
                            </span>
                          </div>
                          {qty > 1 && (
                            <div className="orders-item-qty">
                              <span className="orders-item-qty-badge">×{qty}</span>
                            </div>
                          )}
                          <div className="orders-item-price">
                            {qty > 1 && <span className="orders-item-unit">{formatPrice(item.final_price)} each</span>}
                            <span>{formatPrice(item.final_price * qty)}</span>
                          </div>
                          {item.serial_key && keys.map((key, ki) => (
                            <div key={ki} className="orders-item-key">
                              <FaKey className="orders-item-key-icon" />
                              <code>{key}</code>
                              <button
                                className="orders-item-copy"
                                onClick={() => handleCopyKey(key)}
                                title="Copy serial key"
                              >
                                {copiedKey === key ? (
                                  <FaCheck />
                                ) : (
                                  <FaCopy />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                        );
                      })}

                      {/* Order Summary */}
                      <div className="orders-summary">
                        {details.subtotal != null && (
                          <div className="orders-summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(details.subtotal)}</span>
                          </div>
                        )}
                        {details.discount_total > 0 && (
                          <div className="orders-summary-row orders-summary-discount">
                            <span>Discount</span>
                            <span>-{formatPrice(details.discount_total)}</span>
                          </div>
                        )}
                        <div className="orders-summary-row orders-summary-total">
                          <span>Total</span>
                          <span>{formatPrice(details.total || order.total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default OrdersTab;
