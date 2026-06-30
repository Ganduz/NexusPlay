import { Routes, Route } from 'react-router-dom';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import DashboardTab from '../components/profile/DashboardTab';
import OrdersTab from '../components/profile/OrdersTab';
import WishlistTab from '../components/profile/WishlistTab';
import LibraryTab from '../components/profile/LibraryTab';
import ReviewsTab from '../components/profile/ReviewsTab';
import SettingsTab from '../components/profile/SettingsTab';
import '../styles/pages/ProfilePage.css';

function ProfilePage() {
  return (
    <div className="profile-page container">
      <ProfileHeader />
      <ProfileTabs />

      <div className="profile-content">
        <Routes>
          <Route index element={<DashboardTab />} />
          <Route path="orders" element={<OrdersTab />} />
          <Route path="wishlist" element={<WishlistTab />} />
          <Route path="library" element={<LibraryTab />} />
          <Route path="reviews" element={<ReviewsTab />} />
          <Route path="settings" element={<SettingsTab />} />
        </Routes>
      </div>
    </div>
  );
}

export default ProfilePage;
