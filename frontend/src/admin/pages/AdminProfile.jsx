import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Admin Profile</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Personal administrator account overview and credentials.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">
        {/* Identity Card */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-container text-white flex items-center justify-center font-headline-lg font-bold shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">
                  {user?.name || 'Administrator'}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-surface px-2.5 py-1 rounded font-data-sm text-xs font-bold text-primary border border-outline-variant/30">
                    ID: {user?.email || 'admin'}
                  </span>
                  <span className="bg-surface-container-high px-2 py-1 rounded font-data-sm text-xs text-on-surface-variant font-semibold">
                    {user?.admin_role || 'System Operator'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-full border border-success/30">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                <span className="font-data-sm text-xs font-bold text-success">Active</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/30 font-data-sm text-xs">
              <span className="block text-secondary mb-0.5">Last Login</span>
              <span className="font-bold text-on-surface">
                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col justify-between">
          <h4 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
            Quick Actions
          </h4>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <button
              onClick={() => navigate('/admin/profile/edit')}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-data-sm text-xs font-bold py-2.5 px-4 rounded-lg hover:bg-surface-tint transition-colors shadow-[2px_2px_6px_rgba(163,177,198,0.4)]"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-error/10 text-error font-data-sm text-xs font-bold py-2.5 px-4 rounded-lg hover:bg-error/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Log Out Session
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
