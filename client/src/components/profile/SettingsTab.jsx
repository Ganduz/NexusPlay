import { useState } from 'react';
import {
  FaUser,
  FaExclamationTriangle,
  FaTimes,
  FaCamera,
  FaShieldAlt,
  FaTrashAlt,
} from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import { profileApi } from '../../api/profileApi';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import '../../styles/components/profile/SettingsTab.css';

function SettingsTab() {
  const { user, updateUser, logout } = useAuthStore();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Avatar state
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // ===== Profile Handlers =====
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileForm.username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (profileForm.username.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setIsProfileSaving(true);
    try {
      const { data } = await profileApi.updateProfile({
        username: profileForm.username.trim(),
        bio: profileForm.bio.trim(),
      });
      updateUser(data.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsProfileSaving(false);
    }
  };

  // ===== Avatar Handler =====
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WebP, or GIF)');
      return;
    }

    setIsAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await profileApi.updateAvatar(formData);
      updateUser(data.data);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsAvatarUploading(false);
      e.target.value = '';
    }
  };

  // ===== Delete Account Handler =====
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      await profileApi.updateProfile({ deleted: true });
      toast.success('Account deleted');
      await logout();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="sett animate-fadeInUp">
      {/* ===== Profile Settings Card ===== */}
      <div className="sett-card">
        <div className="sett-card-header">
          <FaUser className="sett-card-icon" />
          <div>
            <h3 className="sett-card-title">Profile Information</h3>
            <p className="sett-card-desc">Update your username, avatar, and bio</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="sett-avatar-section">
          <div className="sett-avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="sett-avatar-img" />
            ) : (
              <span className="sett-avatar-initials">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="sett-avatar-actions">
            <label className="sett-avatar-btn">
              <FaCamera />
              {isAvatarUploading ? 'Uploading...' : 'Change Avatar'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                disabled={isAvatarUploading}
                hidden
              />
            </label>
            <span className="sett-avatar-hint">JPEG, PNG, WebP or GIF. Max 5MB.</span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileSubmit} className="sett-form">
          <div className="sett-field">
            <label className="sett-label" htmlFor="sett-username">
              Username
            </label>
            <input
              id="sett-username"
              type="text"
              value={profileForm.username}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, username: e.target.value }))
              }
              className="sett-input"
              minLength={3}
              maxLength={30}
              required
            />
          </div>

          <div className="sett-field">
            <label className="sett-label" htmlFor="sett-bio">
              Bio
            </label>
            <textarea
              id="sett-bio"
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="sett-textarea"
              rows={3}
              maxLength={500}
              placeholder="Tell us about yourself..."
            />
            <span className="sett-char-count">
              {profileForm.bio.length}/500
            </span>
          </div>

          <button
            type="submit"
            className="sett-submit"
            disabled={isProfileSaving}
          >
            {isProfileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* ===== Danger Zone Card ===== */}
      <div className="sett-card sett-card-danger">
        <div className="sett-card-header">
          <FaShieldAlt className="sett-card-icon sett-icon-danger" />
          <div>
            <h3 className="sett-card-title">Danger Zone</h3>
            <p className="sett-card-desc">
              Irreversible and destructive actions
            </p>
          </div>
        </div>

        <div className="sett-danger-content">
          <div className="sett-danger-info">
            <p>
              Once you delete your account, there is no going back. This will
              permanently remove your profile, reviews, and all associated data.
            </p>
          </div>
          <button
            className="sett-danger-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            <FaTrashAlt />
            Delete Account
          </button>
        </div>
      </div>

      {/* ===== Delete Confirmation Modal ===== */}
      {showDeleteModal && (
        <div
          className="sett-modal-backdrop"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="sett-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <button
              className="sett-modal-close"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="sett-modal-icon">
              <FaExclamationTriangle />
            </div>

            <h3 id="delete-modal-title" className="sett-modal-title">
              Delete Account
            </h3>
            <p className="sett-modal-text">
              This action is <strong>permanent and irreversible</strong>. All
              your data including orders history, reviews, and wishlist will be
              permanently deleted.
            </p>

            <div className="sett-modal-confirm">
              <label className="sett-label" htmlFor="delete-confirm">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="sett-input"
                placeholder="DELETE"
                autoComplete="off"
              />
            </div>

            <div className="sett-modal-actions">
              <button
                className="sett-modal-btn sett-modal-btn-cancel"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancel
              </button>
              <button
                className="sett-modal-btn sett-modal-btn-delete"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsTab;
