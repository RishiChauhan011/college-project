import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchApi(`/admin/users/${id}`);
        setUser(data);
      } catch (err) {
        console.error('Failed to load user details:', err);
        setError('User record not found or inaccessible.');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  return (
    <AdminLayout>
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-data-sm text-data-sm mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Users Catalog
        </button>

        {error ? (
          <div className="bg-error-container text-on-error-container p-6 rounded-xl text-body-sm">
            {error}
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-secondary bg-surface-container-lowest rounded-xl">
            <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
            Loading user profile...
          </div>
        ) : user ? (
          <>
            {/* Header User Card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-container text-white flex items-center justify-center font-headline-lg font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{user.name}</h2>
                  <p className="font-data-md text-data-md text-on-surface-variant flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-sm">mail</span> {user.email}
                    <span className="text-outline-variant">•</span>
                    <span className="text-secondary text-xs">Registered {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full font-data-sm text-xs font-bold flex items-center gap-1.5 border border-tertiary-fixed-dim">
                <span className="w-2 h-2 rounded-full bg-success inline-block"></span> Active Record
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Profile Attributes */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <h3 className="font-data-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
                    Profile Attributes
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-data-sm text-xs text-secondary mb-0.5">Target Field</p>
                      <p className="font-data-md text-on-surface font-semibold">{user.preferred_field || 'Not Specified'}</p>
                    </div>
                    <div>
                      <p className="font-data-sm text-xs text-secondary mb-0.5">Experience</p>
                      <p className="font-data-md text-on-surface font-semibold">{user.experience_years ? `${user.experience_years} Years` : 'Entry Level / Student'}</p>
                    </div>
                    <div>
                      <p className="font-data-sm text-xs text-secondary mb-0.5">Education</p>
                      <p className="font-data-md text-on-surface font-semibold">{user.education || 'Not Specified'}</p>
                    </div>
                    <div>
                      <p className="font-data-sm text-xs text-secondary mb-0.5">Preferred Location</p>
                      <p className="font-data-md text-on-surface font-semibold">{user.preferred_location || 'Flexible / Remote'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <h3 className="font-data-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
                    Source &amp; Ingestion
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                    <div>
                      <p className="font-body-md text-body-sm font-semibold text-on-surface">Data Source</p>
                      <p className="font-data-sm text-xs text-secondary uppercase">{user.source || 'Manual Input'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Skills & Telemetry */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-2">
                    <h3 className="font-data-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Extracted &amp; Verified Skills ({user.skills ? user.skills.length : 0})
                    </h3>
                    <span className="material-symbols-outlined text-primary">psychology</span>
                  </div>
                  {user.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {user.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-surface rounded-lg border border-outline-variant/40 font-data-sm text-data-sm text-on-surface shadow-[inset_2px_2px_5px_rgba(163,177,198,0.3)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary text-body-sm italic py-4">No skills registered for this user profile yet.</p>
                  )}
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <h3 className="font-data-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
                    System Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="px-4 py-2 bg-surface hover:bg-surface-bright border border-outline-variant/40 rounded-lg text-body-sm font-medium transition-colors"
                    >
                      Back to User List
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;
