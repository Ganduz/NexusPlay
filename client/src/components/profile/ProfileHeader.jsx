import { useState, useRef } from 'react';
import { FaCamera, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import { profileApi } from '../../api/profileApi';
import { formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import '../../styles/components/profile/ProfileHeader.css';

function ProfileHeader() {
  const { user, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WebP, or GIF)');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await profileApi.updateAvatar(formData);
      updateUser(data.data);
      toast.success('Avatar updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploading(false);
      // Reset input so re-selecting the same file triggers onChange
      e.target.value = '';
    }
  };

  const initials = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="profile-hdr">
      <div
        className={`profile-hdr-avatar ${isUploading ? 'profile-hdr-avatar-uploading' : ''}`}
        onClick={handleAvatarClick}
        role="button"
        tabIndex={0}
        aria-label="Change avatar"
        onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={`${user.username}'s avatar`}
            className="profile-hdr-avatar-img"
          />
        ) : (
          <span className="profile-hdr-avatar-initials">{initials}</span>
        )}
        <div className="profile-hdr-avatar-overlay">
          {isUploading ? (
            <div className="profile-hdr-avatar-spinner" />
          ) : (
            <>
              <FaCamera className="profile-hdr-avatar-cam" />
              <span>Change</span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleAvatarChange}
          hidden
          aria-hidden="true"
        />
      </div>

      <div className="profile-hdr-info">
        <h1 className="profile-hdr-username">{user?.username}</h1>

        <div className="profile-hdr-meta">
          <span className="profile-hdr-meta-item">
            <FaEnvelope />
            {user?.email}
          </span>
          {user?.created_at && (
            <span className="profile-hdr-meta-item">
              <FaCalendarAlt />
              Member since {formatDate(user.created_at)}
            </span>
          )}
        </div>

        {user?.bio && (
          <p className="profile-hdr-bio">{user.bio}</p>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;
