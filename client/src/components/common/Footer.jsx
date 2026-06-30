import { Link } from 'react-router-dom';
import { FaGamepad, FaHeart } from 'react-icons/fa';
import '../../styles/components/common/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <FaGamepad className="footer-logo-icon" />
              <span>NexusPlay</span>
            </Link>
            <p className="footer-desc">
              Your gaming marketplace. Discover the best deals on PC and console games.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/search">Browse Games</Link>
            <Link to="/search?sort=discount:desc">Best Deals</Link>
          </div>

          {/* Account */}
          <div className="footer-section">
            <h4 className="footer-heading">Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/profile/orders">Order History</Link>
            <Link to="/profile/wishlist">Wishlist</Link>
            <Link to="/profile/library">Game Library</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
