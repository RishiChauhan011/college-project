import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditHasMore, setAuditHasMore] = useState(true);
  const [growthData, setGrowthData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [granularity, setGranularity] = useState('day');
  const [rangeVal, setRangeVal] = useState(15);

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
    const loadAudit = async () => {
      setAuditLoading(true);
      try {
        const data = await fetchApi('/admin/audit-logs?limit=5');
        setAuditLogs(data?.items || []);
        setAuditHasMore(data?.has_more || false);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setAuditLoading(false);
      }
    };
    loadStats();
    loadAudit();
  }, []);

  useEffect(() => {
    const loadGrowth = async () => {
      try {
        const data = await fetchApi(`/admin/analytics/growth?granularity=${granularity}&range_val=${rangeVal}`);
        setGrowthData(data);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Failed to load growth data:', err);
      }
    };
    loadGrowth();
  }, [granularity, rangeVal]);

  const totalUsers = stats?.total_users || 0;
  const activeProfiles = stats?.active_profiles || 0;
  const totalJobs = stats?.total_jobs || 0;
  const totalCompanies = stats?.total_companies || 0;

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

      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Growth / Platform Dynamics */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-data-sm text-[12px] text-secondary uppercase tracking-wider font-bold">User Growth Trends</h3>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">
                {granularity === 'day' ? `Daily user registrations — last ${rangeVal} days.` :
                 granularity === 'week' ? `Weekly user registrations — last ${rangeVal} weeks.` :
                 `Monthly user registrations — last ${rangeVal} months.`}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <select 
                className="px-2 py-1 text-[11px] font-data-sm bg-surface text-on-surface rounded border border-outline-variant/50 outline-none cursor-pointer"
                value={`${granularity}-${rangeVal}`}
                onChange={(e) => {
                  const [g, r] = e.target.value.split('-');
                  setGranularity(g);
                  setRangeVal(parseInt(r, 10));
                }}
              >
                <option value="day-7">Last 7 Days</option>
                <option value="day-15">Last 15 Days</option>
                <option value="month-1">Last 1 Month</option>
                <option value="month-2">Last 2 Months</option>
                <option value="month-6">Last 6 Months</option>
                <option value="month-12">Last 1 Year</option>
              </select>
              <span className="px-3 py-1 text-[11px] font-data-sm bg-surface-container text-on-surface-variant rounded-md border border-outline-variant/30">
                Last updated: {lastUpdated || '...'}
              </span>
            </div>
          </div>
          <div className="flex-1 bg-surface-bright rounded-lg shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] p-4 relative min-h-[220px]">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" vertical={false} />
                  <XAxis dataKey="date" stroke="#767586" fontSize={11} tickMargin={8} tickFormatter={(val) => {
                    // Split date to avoid timezone shifts
                    const parts = val.split('-');
                    if (granularity === 'day') {
                      return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
                    } else if (granularity === 'week') {
                      return `Wk of ${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
                    } else {
                      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
                      return d.toLocaleDateString('default', { month: 'short', year: 'numeric' });
                    }
                  }} />
                  <YAxis stroke="#767586" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid rgba(118, 117, 134, 0.2)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#191c1e', marginBottom: '4px' }}
                    labelFormatter={(label) => {
                      const parts = label.split('-');
                      if (granularity === 'day') return `Date: ${label}`;
                      if (granularity === 'week') return `Week of ${label}`;
                      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
                      return d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
                    }}
                  />
                  <Line type="monotone" name="Registrations" dataKey="registrations" stroke="#4648d4" strokeWidth={3} dot={{ r: 3, fill: '#4648d4' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-secondary font-body-sm text-sm">
                Loading growth data...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Quick Links & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-data-sm text-[12px] text-secondary uppercase tracking-wider font-bold">System Log &amp; Audit</h3>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="bg-surface-bright p-3.5 rounded-lg border border-outline-variant/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
                  <div className="flex-1">
                    <p className="font-body-sm text-[13px] text-on-surface font-medium">{log.action}: {log.entity || 'System'}</p>
                    <p className="font-data-sm text-[10px] text-on-surface-variant mt-0.5">
                      {log.actor} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                    {log.description && (
                      <p className="font-data-sm text-[11px] text-secondary mt-1">{log.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              auditLoading ? (
                <div className="py-4 text-center text-secondary text-sm">Loading logs...</div>
              ) : (
                <div className="py-4 text-center text-secondary text-sm">No recent audit logs available.</div>
              )
            )}
            {auditHasMore && (
              <div className="text-center mt-4">
                <button 
                  onClick={async () => {
                    try {
                      setAuditLoading(true);
                      const data = await fetchApi(`/admin/audit-logs?limit=10&offset=${auditLogs.length}`);
                      setAuditLogs(prev => [...prev, ...(data?.items || [])]);
                      setAuditHasMore(data?.has_more || false);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setAuditLoading(false);
                    }
                  }}
                  disabled={auditLoading}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  {auditLoading ? 'Loading...' : 'Load More Logs'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Administration Actions */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col h-full">
          <h3 className="font-data-sm text-[12px] text-secondary uppercase tracking-wider font-bold mb-4">Quick Operations</h3>
          <div className="flex-1 flex flex-col justify-center">
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
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
