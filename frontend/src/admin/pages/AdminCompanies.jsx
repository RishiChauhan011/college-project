import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topCompanies, setTopCompanies] = useState([]);

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const [compList, analytics] = await Promise.all([
          fetchApi('/companies'),
          fetchApi('/analytics')
        ]);
        setCompanies(compList || []);
        if (analytics?.top_companies) {
          setTopCompanies(analytics.top_companies);
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout searchTerm={search} setSearchTerm={setSearch} searchPlaceholder="Search companies catalog...">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Companies Directory</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Active hiring organizations indexed in market data ({companies.length} total organizations).
          </p>
        </div>
        <Link
          to="/admin/jobs"
          className="bg-surface-container-lowest px-4 py-2 rounded-lg font-data-sm text-data-sm text-primary flex items-center gap-2 hover:bg-surface-bright transition-colors shadow-[2px_2px_6px_rgba(163,177,198,0.4)] border border-outline-variant/30"
        >
          <span className="material-symbols-outlined text-[18px]">work</span> View Associated Jobs
        </Link>
      </div>

      {/* Top Hiring Leaders Callout */}
      {topCompanies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {topCompanies.slice(0, 4).map((tc, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/admin/companies/${encodeURIComponent(tc.company)}`)}
              className="bg-surface-container-lowest p-4 rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center font-data-md font-bold">
                  {tc.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-data-md font-bold text-on-surface text-sm">{tc.company}</h4>
                  <p className="font-data-sm text-xs text-secondary">Active Hiring Leader</p>
                </div>
              </div>
              <span className="font-data-md text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                {tc.count} jobs
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-surface px-3 py-1.5 rounded-lg flex items-center w-72 border border-outline-variant/40 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
            <input
              className="bg-transparent border-none outline-none font-data-sm text-data-sm w-full text-on-surface placeholder-on-surface-variant/70 focus:ring-0 p-0"
              placeholder="Search company name..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Companies Catalog Grid */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
        {loading ? (
          <div className="py-12 text-center text-secondary">
            <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
            Loading companies catalog...
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.slice(0, 60).map((company, idx) => {
              const initial = company.charAt(0).toUpperCase();
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/admin/companies/${encodeURIComponent(company)}`)}
                  className="p-4 bg-surface rounded-xl border border-outline-variant/30 hover:border-primary/50 cursor-pointer transition-all hover:bg-surface-bright flex items-center justify-between group shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary font-bold flex items-center justify-center font-data-md">
                      {initial}
                    </div>
                    <div>
                      <h4 className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors text-sm">
                        {company}
                      </h4>
                      <p className="font-data-sm text-xs text-secondary">Hiring Entity</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all text-[18px]">
                    arrow_forward
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-secondary">
            No companies matching the search criteria.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCompanies;
