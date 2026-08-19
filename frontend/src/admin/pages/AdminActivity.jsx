import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';

const AdminActivity = () => {
  const [filter, setFilter] = useState('all');

  const logs = [
    {
      event: 'Admin Session Initialized',
      type: 'admin',
      actor: 'SYS_ADMIN (admin)',
      entity: 'Control Center Portal',
      timestamp: 'Just now',
      status: 'Success',
      icon: 'verified_user',
    },
    {
      event: 'Market Catalog Sync',
      type: 'system',
      actor: 'Data Pipeline Daemon',
      entity: 'jobs_with_skills.json (2,986 entries)',
      timestamp: '12 mins ago',
      status: 'Completed',
      icon: 'sync',
    },
    {
      event: 'Taxonomy Ingestion',
      type: 'system',
      actor: 'Dataset Preloader',
      entity: 'master_skills.csv (115 skills)',
      timestamp: '1 hour ago',
      status: 'Completed',
      icon: 'dataset',
    },
    {
      event: 'Classifier Model Loaded',
      type: 'system',
      actor: 'ML Inference Engine',
      entity: 'Logistic Regression Model',
      timestamp: 'Today, 08:30 AM',
      status: 'Active',
      icon: 'model_training',
    },
    {
      event: 'Database Health Check',
      type: 'system',
      actor: 'SQLite Persistence Layer',
      entity: 'career_dashboard.db',
      timestamp: 'Today, 08:00 AM',
      status: 'Healthy',
      icon: 'health_and_safety',
    },
  ];

  const filteredLogs = logs.filter((l) => {
    if (filter === 'all') return true;
    return l.type === filter;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Activity &amp; Audit Trail</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Platform-wide event log and audit records.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-surface-container-lowest shadow-[2px_2px_6px_rgba(163,177,198,0.4)] rounded-lg h-9 flex items-center px-3 border border-outline-variant/30">
            <span className="material-symbols-outlined text-secondary text-[18px] mr-2">filter_list</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none text-on-surface font-data-sm text-xs font-bold focus:ring-0 outline-none pr-4 cursor-pointer"
            >
              <option value="all">All Event Types</option>
              <option value="admin">Admin Actions</option>
              <option value="system">System &amp; Pipeline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant/40 text-on-surface-variant font-data-sm text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Event Operation</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-outline-variant/30 hover:bg-surface-bright transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                        <span className="material-symbols-outlined text-[18px]">{log.icon}</span>
                      </div>
                      <span className="font-medium text-sm text-on-surface">{log.event}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-data-sm text-xs font-bold text-secondary">{log.actor}</td>
                  <td className="py-3.5 px-4 text-sm text-on-surface-variant">{log.entity}</td>
                  <td className="py-3.5 px-4 font-data-sm text-xs text-secondary">{log.timestamp}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-data-sm font-bold bg-status-success/10 text-status-success border border-status-success/30">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminActivity;
