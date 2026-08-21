import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState('All');
  const [search, setSearch] = useState('');
  const [availableDomains, setAvailableDomains] = useState([]);

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const domains = await fetchApi('/domains');
        setAvailableDomains(domains || []);
      } catch (err) {
        console.error('Failed to load domains:', err);
      }
    };
    loadDomains();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (domain !== 'All') queryParams.append('domain', domain);
      if (search) queryParams.append('company', search);
      queryParams.append('limit', '50');

      const data = await fetchApi(`/jobs?${queryParams.toString()}`);
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [domain, search]);

  const filteredJobs = jobs.filter((j) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (j.title || '').toLowerCase().includes(s) ||
      (j.company || '').toLowerCase().includes(s) ||
      (j.city || '').toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout searchTerm={search} setSearchTerm={setSearch} searchPlaceholder="Search jobs by title or company...">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Jobs &amp; Market Catalog</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Live market postings with skill taxonomy indexing ({filteredJobs.length} active listings).
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/companies"
            className="bg-surface-container-lowest px-4 py-2 rounded-lg font-data-sm text-data-sm text-primary flex items-center gap-2 hover:bg-surface-bright transition-colors shadow-[2px_2px_6px_rgba(163,177,198,0.4)] border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">business</span> Companies Catalog
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="bg-surface px-3 py-1.5 rounded-lg flex items-center w-72 border border-outline-variant/40 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
            <input
              className="bg-transparent border-none outline-none font-data-sm text-data-sm w-full text-on-surface placeholder-on-surface-variant/70 focus:ring-0 p-0"
              placeholder="Search title, company, city..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-data-sm text-[11px] font-bold text-on-surface-variant uppercase">Domain:</span>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="bg-surface border-outline-variant/40 rounded-lg font-data-sm text-data-sm text-on-surface py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]"
            >
              <option value="All">All Domains</option>
              {availableDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant/40">
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Job Title</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Company &amp; Location</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Career Domain</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider text-center">Skills Matched</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
                    Loading live job catalog...
                  </td>
                </tr>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((j, idx) => (
                  <tr
                    key={idx}
                    onClick={() => navigate(`/admin/jobs/${idx}`)}
                    className="border-b border-outline-variant/30 hover:bg-surface-bright cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-on-surface">
                      <div className="font-semibold text-primary">{j.title}</div>
                      <div className="text-xs text-secondary">{j.posted_date ? new Date(j.posted_date).toLocaleDateString() : 'Active'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-on-surface">{j.company}</div>
                      <div className="text-xs text-on-surface-variant">{j.city || 'Remote'}, {j.state || ''}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-surface rounded font-data-sm text-xs font-semibold text-secondary border border-outline-variant/30">
                        {j.career_domain}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary font-data-sm text-xs font-bold rounded-full">
                        {j.skill_count || 0} skills
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/jobs/${idx}`);
                        }}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                        title="View Job Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-secondary">
                    No jobs matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminJobs;
