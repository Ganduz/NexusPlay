import { NavLink } from 'react-router-dom';
import {
  FaChartBar,
  FaShoppingBag,
  FaHeart,
  FaGamepad,
  FaStar,
  FaCog,
} from 'react-icons/fa';
import '../../styles/components/profile/ProfileTabs.css';

const tabs = [
  { to: '/profile', label: 'Dashboard', icon: FaChartBar, end: true },
  { to: '/profile/orders', label: 'Orders', icon: FaShoppingBag },
  { to: '/profile/wishlist', label: 'Wishlist', icon: FaHeart },
  { to: '/profile/library', label: 'Library', icon: FaGamepad },
  { to: '/profile/reviews', label: 'Reviews', icon: FaStar },
  { to: '/profile/settings', label: 'Settings', icon: FaCog },
];

function ProfileTabs() {
  return (
    <nav className="profile-tabs" role="tablist" aria-label="Profile navigation">
      <div className="profile-tabs-track">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            role="tab"
            className={({ isActive }) =>
              `profile-tabs-item ${isActive ? 'profile-tabs-item-active' : ''}`
            }
          >
            <Icon className="profile-tabs-icon" />
            <span className="profile-tabs-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default ProfileTabs;
