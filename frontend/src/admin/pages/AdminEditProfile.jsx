import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../api/apiClient';

const AdminEditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    admin_id: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        admin_id: user.email || '',
        role: user.admin_role || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updatedUser = await fetchApi('/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      setUser(updatedUser);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/admin/profile');
      }, 1500);
      
    } catch (err) {
      console.error('Failed to update admin profile:', err);
      setError(err.message || 'An error occurred while saving your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/profile')}
          className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-dim flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-secondary">arrow_back</span>
        </button>
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Edit Profile</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Update your administrator credentials and role.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-body-sm font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-success/10 text-success border border-success/30 rounded-xl text-body-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            Profile updated successfully. Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-data-sm font-bold text-on-surface mb-2">Admin ID</label>
            <input
              type="text"
              name="admin_id"
              value={formData.admin_id}
              onChange={handleChange}
              placeholder="e.g. admin"
              required
              className="w-full px-4 py-3 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-on-surface"
            />
            <p className="text-xs text-secondary mt-1.5 font-data-sm">This is used for logging into the Control Center.</p>
          </div>

          <div>
            <label className="block text-sm font-data-sm font-bold text-on-surface mb-2">Role Title</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. System Operator"
              required
              className="w-full px-4 py-3 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-on-surface"
            />
          </div>

          <div className="pt-6 border-t border-outline-variant/30 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/profile')}
              className="px-6 py-2.5 rounded-lg bg-surface-container hover:bg-surface-dim text-on-surface font-data-sm text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-surface-tint text-white font-data-sm text-xs font-bold transition-colors shadow-[2px_2px_6px_rgba(163,177,198,0.4)] disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminEditProfile;
