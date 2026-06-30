import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaUser, FaSearch, FaTimes, FaSignOutAlt, FaGamepad } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import SearchBar from './SearchBar';
import { useClickOutside } from '../../hooks/useClickOutside';
import '../../styles/components/common/Navbar.css';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartStore = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);

  const profileRef = useClickOutside(() => setIsProfileDropdown(false));

  const itemCount = cartStore.items?.length || 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdown(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <FaGamepad className="navbar-logo-icon" />
          <span className="navbar-logo-text">NexusPlay</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>Browse</Link>
        </div>

        {/* Search */}
        <div className={`navbar-search ${isSearchOpen ? 'navbar-search-open' : ''}`}>
          <SearchBar onClose={() => setIsSearchOpen(false)} />
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="navbar-action-btn" onClick={() => setIsSearchOpen(!isSearchOpen)} title="Search">
            {isSearchOpen ? <FaTimes /> : <FaSearch />}
          </button>

          {isAuthenticated && (
            <Link to="/profile/wishlist" className="navbar-action-btn" title="Wishlist">
              <FaHeart />
            </Link>
          )}

          <Link to="/cart" className="navbar-action-btn navbar-cart-btn" title="Cart">
            <FaShoppingCart />
            {itemCount > 0 && <span className="navbar-cart-badge">{itemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="navbar-profile" ref={profileRef}>
              <button
                className="navbar-profile-btn"
                onClick={() => setIsProfileDropdown(!isProfileDropdown)}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="navbar-avatar" />
                ) : (
                  <FaUser />
                )}
              </button>

              {isProfileDropdown && (
                <div className="navbar-dropdown animate-slideDown">
                  <div className="navbar-dropdown-header">
                    <span className="navbar-dropdown-username">{user?.username}</span>
                    <span className="navbar-dropdown-email">{user?.email}</span>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to="/profile" className="navbar-dropdown-item" onClick={() => setIsProfileDropdown(false)}>
                    <FaUser /> Profile
                  </Link>
                  <Link to="/profile/orders" className="navbar-dropdown-item" onClick={() => setIsProfileDropdown(false)}>
                    <FaShoppingCart /> Orders
                  </Link>
                  <Link to="/profile/wishlist" className="navbar-dropdown-item" onClick={() => setIsProfileDropdown(false)}>
                    <FaHeart /> Wishlist
                  </Link>
                  <Link to="/profile/library" className="navbar-dropdown-item" onClick={() => setIsProfileDropdown(false)}>
                    <FaGamepad /> Library
                  </Link>
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn">Sign In</Link>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
