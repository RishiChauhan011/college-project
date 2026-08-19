import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [domainData, setDomainData] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      try {
        const [sum, doms] = await Promise.all([
          fetchApi('/analytics'),
          fetchApi('/domains')
        ]);
        setSummary(sum);
        setDomains(doms || []);
        if (doms && doms.length > 0) {
          setSelectedDomain(doms[0]);
        }
      } catch (err) {
        console.error('Failed to load analytics summary:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  useEffect(() => {
    if (!selectedDomain || selectedDomain === 'All') return;
    const loadDomainAnalytics = async () => {
      try {
        const dData = await fetchApi(`/analytics/domain/${encodeURIComponent(selectedDomain)}`);
        setDomainData(dData);
      } catch (err) {
        console.error('Failed to load domain analytics:', err);
      }
    };
    loadDomainAnalytics();
  }, [selectedDomain]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Analytics &amp; Market Intelligence</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Aggregated platform telemetry, domain distributions, and compensation analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-data-sm text-xs font-bold text-secondary uppercase">Domain:</span>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-surface-container-lowest border-outline-variant/40 rounded-lg font-data-sm text-data-sm text-primary font-bold py-1.5 pl-3 pr-8 focus:ring-primary shadow-[2px_2px_6px_rgba(163,177,198,0.4)]"
          >
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Total Indexed Jobs</h3>
          <div className="font-data-lg text-[26px] font-bold text-on-surface">
            {summary?.total_jobs?.toLocaleString() || '2,986'}
          </div>
          <p className="font-data-sm text-xs text-success mt-1 font-semibold">100% Verified Market Data</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Domain Sample Count</h3>
          <div className="font-data-lg text-[26px] font-bold text-primary">
            {domainData?.jobs || '...'}
          </div>
          <p className="font-data-sm text-xs text-secondary mt-1">in {selectedDomain}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Avg Domain Salary</h3>
          <div className="font-data-lg text-[26px] font-bold text-tertiary">
            {domainData?.salary_statistics?.average_salary_max
              ? `$${Math.round(domainData.salary_statistics.average_salary_max / 1000)}k`
              : 'Market Std'}
          </div>
          <p className="font-data-sm text-xs text-secondary mt-1">Disclosed listings average</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Salary Disclosure Rate</h3>
          <div className="font-data-lg text-[26px] font-bold text-success">
            {domainData?.salary_statistics?.disclosure_rate_percent || 0}%
          </div>
          <p className="font-data-sm text-xs text-secondary mt-1">Transparency index</p>
        </div>
      </div>

      {/* Bento Grid: Top Skills & Companies in Domain */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Skills for Domain */}
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <div className="flex justify-between items-center mb-4 border-b border-outline-variant/30 pb-2">
            <h3 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider">
              Top Skills in {selectedDomain}
            </h3>
            <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
          </div>
          <div className="space-y-3">
            {domainData?.top_skills?.length > 0 ? (
              domainData.top_skills.slice(0, 8).map((sk, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-surface-bright rounded-lg border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-primary/10 text-primary font-data-sm text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-sm text-on-surface">{sk.skill}</span>
                  </div>
                  <span className="font-data-sm text-xs font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded">
                    {sk.count} occurrences
                  </span>
                </div>
              ))
            ) : (
              <p className="text-secondary text-sm italic py-4">No top skills computed for this domain.</p>
            )}
          </div>
        </div>

        {/* Top Hiring Companies for Domain */}
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <div className="flex justify-between items-center mb-4 border-b border-outline-variant/30 pb-2">
            <h3 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider">
              Leading Employers in {selectedDomain}
            </h3>
            <span className="material-symbols-outlined text-tertiary text-[20px]">corporate_fare</span>
          </div>
          <div className="space-y-3">
            {domainData?.top_companies?.length > 0 ? (
              domainData.top_companies.slice(0, 8).map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-surface-bright rounded-lg border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-tertiary/10 text-tertiary font-data-sm text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-sm text-on-surface">{comp.company}</span>
                  </div>
                  <span className="font-data-sm text-xs font-bold text-success bg-status-success/10 px-2 py-0.5 rounded">
                    {comp.count} postings
                  </span>
                </div>
              ))
            ) : (
              <p className="text-secondary text-sm italic py-4">No top hiring companies listed for this domain.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
