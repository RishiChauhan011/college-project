import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';
import { fetchApi } from '../api/apiClient';
import { useDomain } from '../context/DomainContext';
import { useDashboardData } from '../context/DashboardDataContext';

const Companies = () => {
  const navigate = useNavigate();
  const { domain } = useDomain();
  const { domainAnalytics } = useDashboardData();
  const [loading, setLoading] = useState(true);
  const [topCompanies, setTopCompanies] = useState([]);

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const analytics = await fetchApi('/analytics').catch(() => null);
        if (analytics?.top_companies) {
          setTopCompanies(analytics.top_companies);
        }
      } catch (err) {
        console.error('Failed to load companies analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  const effectiveTopCompanies = domainAnalytics?.top_companies?.length > 0
    ? domainAnalytics.top_companies
    : topCompanies;

  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar showNavLinks={false} />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/20 pb-6">
          <div>
            <h1 className="text-headline-xl font-headline-xl text-on-surface font-extrabold mb-2">
              Top Hiring Companies
            </h1>
            <p className="text-body-lg font-body-lg text-secondary">
              Organizations actively recruiting talent for key skills in {domain || 'your domain'}.
            </p>
          </div>
        </div>

        {/* Top Hiring Employers List */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 elevation-1 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">corporate_fare</span>
              <div>
                <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                  Featured Employers in {domain || 'All Domains'}
                </h2>
                <p className="text-body-sm text-secondary">
                  Based on live job market demand index
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-secondary">
              <span className="material-symbols-outlined animate-spin align-middle mr-2 text-primary text-2xl">progress_activity</span>
              Loading hiring leaders...
            </div>
          ) : effectiveTopCompanies.length > 0 ? (
            <div className="space-y-3">
              {effectiveTopCompanies.slice(0, 15).map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/companies/${encodeURIComponent(comp.company)}`)}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-bright hover:bg-surface border border-outline-variant/20 hover:border-primary/40 cursor-pointer transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-container/30 text-primary font-extrabold flex items-center justify-center text-body-lg shrink-0 border border-primary/20">
                      {comp.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors text-body-md">
                        {comp.company}
                      </h3>
                      <p className="text-xs text-secondary font-medium">Active Hiring Partner</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-primary/10 text-primary font-bold text-data-sm px-3.5 py-1.5 rounded-full border border-primary/20">
                      {comp.count} open roles
                    </span>
                    <span className="material-symbols-outlined text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all text-base">
                      arrow_forward
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-secondary font-medium">
              No company data currently indexed for {domain || 'this domain'}.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Companies;
