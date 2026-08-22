import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';
import { fetchApi } from '../api/apiClient';

const CompanyDetail = () => {
  const { id } = useParams();
  const companyName = decodeURIComponent(id || '');
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyJobs = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/jobs?company=${encodeURIComponent(companyName)}&limit=50`);
        setJobs(data || []);
      } catch (err) {
        console.error('Failed to load company jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCompanyJobs();
  }, [companyName]);

  const formatLocation = (city, state, fallback = 'Multiple Locations') => {
    const parts = [city, state]
      .map((p) => (p || '').trim())
      .filter((p) => p && p.toLowerCase() !== 'unknown');
    return parts.length > 0 ? parts.join(', ') : fallback;
  };

  const totalPositions = jobs.length;
  const primaryDomain = jobs[0]?.career_domain || 'Technology & Engineering';
  const sampleLocation = formatLocation(jobs[0]?.city, jobs[0]?.state, 'Multiple Locations');

  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar showNavLinks={false} />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-bold text-data-sm mb-6 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Companies Directory
        </button>

        {/* Company Header Card */}
        <div className="bg-surface rounded-2xl elevation-1 border border-outline-variant/20 p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-bright text-primary font-headline-lg font-bold flex items-center justify-center shadow-sm border border-outline-variant/20">
              {companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">{companyName}</h1>
              <div className="flex items-center gap-3 text-data-sm text-xs text-secondary mt-1">
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span> {sampleLocation}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">domain</span> {primaryDomain}
                </span>
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-success/10 border border-success/30 flex items-center gap-1.5 text-xs font-bold text-success">
            <span className="w-2 h-2 rounded-full bg-success"></span> Indexed Hiring Partner
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface rounded-xl p-5 elevation-1 border border-outline-variant/20">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Total Openings</h3>
            <div className="text-headline-lg font-bold text-primary">{totalPositions}</div>
            <p className="text-xs text-secondary mt-1">Active indexed roles</p>
          </div>
          <div className="bg-surface rounded-xl p-5 elevation-1 border border-outline-variant/20">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Primary Domain</h3>
            <div className="text-headline-lg text-[18px] font-bold text-on-surface truncate">{primaryDomain}</div>
            <p className="text-xs text-secondary mt-1">Core specialization</p>
          </div>
        </div>

        {/* Openings Table */}
        <div className="bg-surface rounded-2xl elevation-1 border border-outline-variant/20 overflow-hidden">
          <div className="p-5 border-b border-outline-variant/20 bg-surface-bright flex justify-between items-center">
            <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">
              Active Job Postings at {companyName}
            </h3>
            <span className="text-xs font-bold text-primary bg-primary-fixed px-3 py-1 rounded-md">
              {jobs.length} Available
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/20 text-secondary text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Role Title</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Domain</th>
                  <th className="py-3.5 px-6 text-center">Skill Count</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-secondary">
                      <span className="material-symbols-outlined animate-spin align-middle mr-2 text-primary">progress_activity</span>
                      Loading openings for {companyName}...
                    </td>
                  </tr>
                ) : jobs.length > 0 ? (
                  jobs.map((job, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-outline-variant/10 hover:bg-surface-bright transition-colors"
                    >
                      <td className="py-3.5 px-6 font-bold text-primary">{job.title}</td>
                      <td className="py-3.5 px-6 text-secondary">{formatLocation(job.city, job.state, 'Remote')}</td>
                      <td className="py-3.5 px-6 text-xs text-on-surface-variant font-medium">{job.career_domain}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="px-2.5 py-1 bg-surface-container-highest rounded text-xs font-bold text-secondary">
                          {job.skill_count || 0} skills
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-secondary">
                      No active listings found for this company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDetail;
