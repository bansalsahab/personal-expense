import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
      }
    }

    setLoading(true);
    try {
      await updateProfile({ name, currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="card">
        <div className="card-header">
          <h3>Profile Settings</h3>
        </div>
        <div className="card-body">
          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <div className="profile-info">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <h4>{user?.name}</h4>
              <p>{user?.email}</p>
              <span className="member-since">
                Member since {new Date(user?.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h4>Personal Information</h4>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="disabled"
                />
                <small>Email cannot be changed</small>
              </div>
            </div>

            <div className="form-section">
              <h4>Change Password</h4>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
