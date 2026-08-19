import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { useAuth } from '../../context/AuthContext';

const AdminSettings = () => {
  const { user } = useAuth();
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);
  const [cacheSync, setCacheSync] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Admin Platform Settings</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          System operational configurations, data pipeline toggles, and security controls.
        </p>
      </div>

      {savedNotice && (
        <div className="mb-6 p-4 bg-status-success/15 border border-status-success/30 text-status-success rounded-xl font-data-sm text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Configuration preferences saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Platform Configurations */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
            <h3 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
              Pipeline &amp; System Preferences
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-bright rounded-lg border border-outline-variant/30">
                <div>
                  <h4 className="font-body-md text-sm font-semibold text-on-surface">Data Cache Auto-Preload</h4>
                  <p className="font-data-sm text-xs text-secondary">Keep 2,986 jobs and 115 skills preloaded in memory at startup</p>
                </div>
                <input
                  type="checkbox"
                  checked={cacheSync}
                  onChange={(e) => setCacheSync(e.target.checked)}
                  className="w-5 h-5 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-bright rounded-lg border border-outline-variant/30">
                <div>
                  <h4 className="font-body-md text-sm font-semibold text-on-surface">Live Market Telemetry Logging</h4>
                  <p className="font-data-sm text-xs text-secondary">Track query hits for high-demand skills &amp; hiring analytics</p>
                </div>
                <input
                  type="checkbox"
                  checked={telemetryEnabled}
                  onChange={(e) => setTelemetryEnabled(e.target.checked)}
                  className="w-5 h-5 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white font-data-sm text-xs font-bold rounded-lg hover:bg-surface-tint transition-colors shadow-[2px_2px_6px_rgba(163,177,198,0.4)]"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
            <h3 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
              Authentication Security
            </h3>
            <div className="space-y-3 font-data-sm text-xs">
              <div className="flex justify-between p-2 bg-surface rounded">
                <span className="text-secondary">Admin Operator:</span>
                <span className="font-bold text-on-surface">{user?.name || 'Administrator'}</span>
              </div>
              <div className="flex justify-between p-2 bg-surface rounded">
                <span className="text-secondary">Algorithm:</span>
                <span className="font-bold text-primary">JWT HS-256 + Bcrypt</span>
              </div>
              <div className="flex justify-between p-2 bg-surface rounded">
                <span className="text-secondary">Role Level:</span>
                <span className="font-bold text-success">Super Admin (L1)</span>
              </div>
              <div className="flex justify-between p-2 bg-surface rounded">
                <span className="text-secondary">Backend Origin:</span>
                <span className="font-bold text-on-surface">http://localhost:8000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
