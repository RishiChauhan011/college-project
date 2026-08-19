import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setError('Failed to fetch platform metrics.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalUsers = stats?.total_users || 0;
  const activeProfiles = stats?.active_profiles || 0;
  const totalJobs = stats?.total_jobs || 0;
  const totalCompanies = stats?.total_companies || 0;
  const totalSkills = stats?.total_skills || 0;

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Platform Overview</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">High-level metrics and system telemetry.</p>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-data-sm text-data-sm bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant/30">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
          <span className="font-semibold text-on-surface">CONTROL CENTER ACTIVE</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-body-sm">
          {error}
        </div>
      )}

      {/* Metric Readouts (Level 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Users */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-surface-container-lowest rounded-xl p-4 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col justify-between h-[110px] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-data-sm text-[11px] text-secondary uppercase tracking-wider font-bold">Total Users</h3>
            <span className="material-symbols-outlined text-[16px] text-primary">group</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-data-lg text-[22px] font-bold text-on-surface">
              {loading ? '...' : totalUsers}
            </span>
            <span className="text-[11px] font-data-sm text-secondary">Registered</span>
          </div>
        </div>

        {/* Active Profiles */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-surface-container-lowest rounded-xl p-4 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col justify-between h-[110px] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-data-sm text-[11px] text-secondary uppercase tracking-wider font-bold">Active Profiles</h3>
            <span className="material-symbols-outlined text-[16px] text-success">badge</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-data-lg text-[22px] font-bold text-on-surface">
              {loading ? '...' : activeProfiles}
            </span>
            <span className="text-[11px] font-data-sm text-success">Customized</span>
          </div>
        </div>

        {/* Total Jobs */}
        <div
          onClick={() => navigate('/admin/jobs')}
          className="bg-surface-container-lowest rounded-xl p-4 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col justify-between h-[110px] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-data-sm text-[11px] text-secondary uppercase tracking-wider font-bold">Market Jobs</h3>
            <span className="material-symbols-outlined text-[16px] text-waypoint">work</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-data-lg text-[22px] font-bold text-on-surface">
              {loading ? '...' : totalJobs.toLocaleString()}
            </span>
            <span className="text-[11px] font-data-sm text-secondary">Active</span>
          </div>
        </div>

        {/* Companies */}
        <div
          onClick={() => navigate('/admin/companies')}
          className="bg-surface-container-lowest rounded-xl p-4 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col justify-between h-[110px] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-data-sm text-[11px] text-secondary uppercase tracking-wider font-bold">Companies</h3>
            <span className="material-symbols-outlined text-[16px] text-tertiary">business</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-data-lg text-[22px] font-bold text-on-surface">
              {loading ? '...' : totalCompanies.toLocaleString()}
            </span>
            <span className="text-[11px] font-data-sm text-secondary">Hiring</span>
          </div>
        </div>

        {/* Total Skills */}
        <div
          onClick={() => navigate('/admin/skills')}
          className="bg-surface-container-lowest rounded-xl p-4 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col justify-between h-[110px] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-data-sm text-[11px] text-secondary uppercase tracking-wider font-bold">Skills Catalog</h3>
            <span className="material-symbols-outlined text-[16px] text-warning">psychology</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-data-lg text-[22px] font-bold text-on-surface">
              {loading ? '...' : totalSkills}
            </span>
            <span className="text-[11px] font-data-sm text-success">+Taxonomy</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Growth / Platform Dynamics */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-data-sm text-[12px] text-secondary uppercase tracking-wider font-bold">Platform Dynamics &amp; Activity</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 text-xs font-data-sm bg-surface-container text-primary font-bold rounded-md shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">Live Telemetry</span>
            </div>
          </div>
          <div className="flex-1 bg-surface-bright rounded-lg shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] p-6 relative min-h-[220px] flex items-end justify-between">
            <svg className="absolute bottom-4 left-4 right-4 w-[calc(100%-32px)] h-[calc(100%-32px)] overflow-visible" viewBox="0 0 500 180">
              <defs>
                <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4648d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4648d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,150 C70,140 140,110 210,95 C280,80 350,50 420,35 C460,25 480,20 500,15 L500,180 L0,180 Z" fill="url(#chartGrad)" />
              <path d="M0,150 C70,140 140,110 210,95 C280,80 350,50 420,35 C460,25 480,20 500,15" fill="none" stroke="#4648d4" strokeWidth="3" />
              <circle cx="210" cy="95" fill="#ffffff" r="4" stroke="#4648d4" strokeWidth="2" />
              <circle cx="350" cy="50" fill="#ffffff" r="4" stroke="#4648d4" strokeWidth="2" />
              <circle cx="500" cy="15" fill="#ffffff" r="4" stroke="#4648d4" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-outline font-data-sm text-[11px]">
              <span>Ingestion</span>
              <span>Classification</span>
              <span>Skill Extraction</span>
              <span>Gap Prediction</span>
              <span>Market Alignment</span>
            </div>
          </div>
        </div>

        {/* Top Demanded Skills Preview */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-data-sm text-[12px] text-secondary uppercase tracking-wider font-bold">High Demand Skills</h3>
            <Link to="/admin/skills" className="text-xs text-primary font-data-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-3.5">
            {[
              { skill: 'Python', pct: 92 },
              { skill: 'Machine Learning', pct: 86 },
              { skill: 'SQL & Data Analysis', pct: 78 },
              { skill: 'Cloud Architecture', pct: 69 },
              { skill: 'Deep Learning', pct: 62 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between font-data-sm text-[11px] mb-1">
                  <span className="text-on-surface font-medium">{item.skill}</span>
                  <span className="text-primary font-bold">{item.pct}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin/skills')}
            className="mt-4 w-full py-2 text-center font-data-sm text-xs font-bold text-primary hover:bg-surface-bright rounded-md border border-primary/20 transition-colors"
          >
            EXPLORE TAXONOMY
          </button>
        </div>
      </div>

      {/* Bottom Section: Quick Links & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-data-sm text-[12px] text-secondary uppercase tracking-wider font-bold">System Log &amp; Audit</h3>
            <Link to="/admin/activity" className="text-xs text-primary font-data-sm hover:underline">Full Log</Link>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-bright p-3.5 rounded-lg border border-outline-variant/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
              <div className="flex-1">
                <p className="font-body-sm text-[13px] text-on-surface font-medium">Administrator Session Authenticated</p>
                <p className="font-data-sm text-[10px] text-on-surface-variant mt-0.5">AUTH_PROVIDER • Status 200 OK</p>
              </div>
              <span className="font-data-sm text-[11px] text-success font-bold">ONLINE</span>
            </div>
            <div className="bg-surface-bright p-3.5 rounded-lg border border-outline-variant/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-waypoint text-[20px] mt-0.5">database</span>
              <div className="flex-1">
                <p className="font-body-sm text-[13px] text-on-surface font-medium">Market Catalog Synchronized: {totalJobs} active jobs loaded</p>
                <p className="font-data-sm text-[10px] text-on-surface-variant mt-0.5">DATA_PIPELINE • 2,986 entries indexed</p>
              </div>
              <span className="font-data-sm text-[11px] text-secondary">SYNCED</span>
            </div>
            <div className="bg-surface-bright p-3.5 rounded-lg border border-outline-variant/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">model_training</span>
              <div className="flex-1">
                <p className="font-body-sm text-[13px] text-on-surface font-medium">AI Career Role-Fit Logistic Classifier Active</p>
                <p className="font-data-sm text-[10px] text-on-surface-variant mt-0.5">ML_INFERENCE • Accuracy benchmark verified</p>
              </div>
              <span className="font-data-sm text-[11px] text-primary font-bold">READY</span>
            </div>
          </div>
        </div>

        {/* Quick Administration Actions */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col justify-between">
          <h3 className="font-data-sm text-[12px] text-secondary uppercase tracking-wider font-bold mb-4">Quick Operations</h3>
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full text-left p-3 rounded-lg bg-surface-bright hover:bg-surface-container transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
                <span className="font-body-md text-body-sm font-medium">Manage Users</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="w-full text-left p-3 rounded-lg bg-surface-bright hover:bg-surface-container transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-waypoint text-[20px]">dataset</span>
                <span className="font-body-md text-body-sm font-medium">Inspect Job Postings</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="w-full text-left p-3 rounded-lg bg-surface-bright hover:bg-surface-container transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary text-[20px]">insights</span>
                <span className="font-body-md text-body-sm font-medium">View Market Telemetry</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30 text-center">
            <span className="text-data-sm text-[11px] text-secondary">PathFinder AI Engine v2.0</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
