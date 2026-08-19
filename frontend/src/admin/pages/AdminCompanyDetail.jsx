import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminCompanyDetail = () => {
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

  const totalPositions = jobs.length;
  const primaryDomain = jobs[0]?.career_domain || 'Technology & Engineering';
  const sampleLocation = jobs[0]?.city ? `${jobs[0].city}, ${jobs[0].state || ''}` : 'Multiple Locations';

  return (
    <AdminLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/companies')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-data-sm text-data-sm mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Companies Catalog
        </button>

        {/* Company Header */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface-container-highest text-primary font-headline-lg font-bold flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
              {companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{companyName}</h2>
              <div className="flex items-center gap-3 font-data-sm text-xs text-secondary mt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">location_on</span> {sampleLocation}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">domain</span> {primaryDomain}
                </span>
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-status-success/10 border border-status-success/30 flex items-center gap-1.5 font-data-sm text-xs font-bold text-status-success">
            <span className="w-2 h-2 rounded-full bg-status-success"></span> Verified Organization
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
            <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Total Openings</h3>
            <div className="font-data-lg text-[24px] font-bold text-primary">{totalPositions}</div>
            <p className="font-data-sm text-xs text-secondary mt-1">Active indexed roles</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
            <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Primary Domain</h3>
            <div className="font-data-lg text-[18px] font-bold text-on-surface truncate">{primaryDomain}</div>
            <p className="font-data-sm text-xs text-secondary mt-1">Core specialization</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
            <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Taxonomy Coverage</h3>
            <div className="font-data-lg text-[24px] font-bold text-success">100%</div>
            <p className="font-data-sm text-xs text-secondary mt-1">Skill mapped to database</p>
          </div>
        </div>

        {/* Openings Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-bright flex justify-between items-center">
            <h3 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider">
              Active Job Postings at {companyName}
            </h3>
            <span className="font-data-sm text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              {jobs.length} Available
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/30 text-on-surface-variant font-data-sm text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4 text-right">Compensation</th>
                  <th className="py-3 px-4 text-center">Skills</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-secondary">
                      Loading openings for {companyName}...
                    </td>
                  </tr>
                ) : jobs.length > 0 ? (
                  jobs.map((job, idx) => (
                    <tr
                      key={idx}
                      onClick={() => navigate(`/admin/jobs/${idx}`)}
                      className="border-b border-outline-variant/20 hover:bg-surface-bright cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-primary">{job.title}</td>
                      <td className="py-3 px-4 text-secondary">{job.city || 'Remote'}</td>
                      <td className="py-3 px-4 font-data-sm text-xs text-on-surface-variant">{job.career_domain}</td>
                      <td className="py-3 px-4 text-right font-data-md font-semibold">
                        {job.salary_max ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k` : 'Undisclosed'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-surface rounded text-xs font-data-sm font-bold text-secondary">
                          {job.skill_count || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-secondary">
                      No active listings found for this company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCompanyDetail;
