import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGamepad,
  FaWallet,
  FaHeart,
  FaStar,
  FaShoppingBag,
  FaArrowRight,
  FaBoxOpen,
} from 'react-icons/fa';
import { profileApi } from '../../api/profileApi';
import { ordersApi } from '../../api/ordersApi';
import { formatPrice, formatDate } from '../../utils/formatters';
import Loader from '../common/Loader';
import '../../styles/components/profile/DashboardTab.css';

function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [dashRes, ordersRes] = await Promise.all([
          profileApi.getDashboard(),
          ordersApi.getAll({ page: 1, limit: 3 }),
        ]);
        setStats(dashRes.data.data);
        setRecentOrders(ordersRes.data.data.orders || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) return <Loader text="Loading dashboard..." />;

  if (error) {
    return (
      <div className="dash-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const statCards = [
    {
      icon: FaGamepad,
      value: stats?.library ?? 0,
      label: 'Games Owned',
      color: '#7c3aed',
    },
    {
      icon: FaWallet,
      value: formatPrice(stats?.total_spent ?? 0),
      label: 'Total Spent',
      color: '#10b981',
    },
    {
      icon: FaHeart,
      value: stats?.wishlist ?? 0,
      label: 'Wishlist',
      color: '#ef4444',
    },
    {
      icon: FaStar,
      value: stats?.reviews ?? 0,
      label: 'Reviews Written',
      color: '#f59e0b',
    },
  ];

  return (
    <div className="dash animate-fadeInUp">
      {/* Stat Cards */}
      <div className="dash-stats">
        {statCards.map(({ icon: Icon, value, label, color }) => (
          <div className="dash-stat-card" key={label}>
            <div className="dash-stat-icon" style={{ color, background: `${color}15` }}>
              <Icon />
            </div>
            <div className="dash-stat-content">
              <span className="dash-stat-value">{value}</span>
              <span className="dash-stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>
            <FaBoxOpen /> Recent Orders
          </h3>
          <Link to="/profile/orders" className="dash-section-link">
            View All <FaArrowRight />
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="dash-orders">
            {recentOrders.map((order) => (
              <div key={order.id} className="dash-order-row">
                <div className="dash-order-info">
                  <span className="dash-order-number">{order.order_number}</span>
                  <span className="dash-order-date">{formatDate(order.created_at)}</span>
                </div>
                <div className="dash-order-right">
                  <span className={`dash-order-status dash-order-status-${order.status}`}>
                    {order.status}
                  </span>
                  <span className="dash-order-total">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="dash-empty-text">No orders yet. Start browsing!</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Quick Links</h3>
        </div>
        <div className="dash-quick-links">
          <Link to="/search" className="dash-quick-link">
            <FaGamepad />
            <span>Browse Games</span>
          </Link>
          <Link to="/profile/library" className="dash-quick-link">
            <FaBoxOpen />
            <span>My Library</span>
          </Link>
          <Link to="/profile/wishlist" className="dash-quick-link">
            <FaHeart />
            <span>My Wishlist</span>
          </Link>
          <Link to="/profile/settings" className="dash-quick-link">
            <FaStar />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
