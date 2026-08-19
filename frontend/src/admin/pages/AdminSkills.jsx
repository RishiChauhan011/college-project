import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminSkills = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const loadSkills = async () => {
      setLoading(true);
      try {
        const data = await fetchApi('/skills');
        setSkills(data || []);
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSkills();
  }, []);

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(skills.map((s) => s.category).filter(Boolean))];

  return (
    <AdminLayout searchTerm={search} setSearchTerm={setSearch} searchPlaceholder="Search taxonomy skills...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Skills Intelligence</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Platform-wide competency tracking and market demand analysis ({skills.length} skills in master taxonomy).
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="bg-surface px-3 py-1.5 rounded-lg flex items-center w-72 border border-outline-variant/40 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
            <input
              className="bg-transparent border-none outline-none font-data-sm text-data-sm w-full text-on-surface placeholder-on-surface-variant/70 focus:ring-0 p-0"
              placeholder="Search skill name or id..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-data-sm text-[11px] font-bold text-on-surface-variant uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-surface border-outline-variant/40 rounded-lg font-data-sm text-data-sm text-on-surface py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Skills Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant/40">
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Skill ID &amp; Name</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Category</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Subtype</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider text-center">Status</th>
                <th className="py-3.5 px-4 font-data-sm text-[11px] font-bold uppercase text-on-surface-variant tracking-wider text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-secondary">
                    <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
                    Loading skills taxonomy...
                  </td>
                </tr>
              ) : filteredSkills.length > 0 ? (
                filteredSkills.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/admin/skills/${s.id}`)}
                    className="border-b border-outline-variant/30 hover:bg-surface-bright cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-data-sm text-xs font-bold text-primary border border-outline-variant/30">
                          {s.id}
                        </span>
                        <span className="font-medium text-on-surface text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-data-sm text-xs text-secondary font-medium">
                      {s.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 bg-surface rounded text-xs font-data-sm text-on-surface border border-outline-variant/30">
                        {s.skill_type || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-data-sm font-bold bg-status-success/10 text-status-success border border-status-success/30">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/skills/${s.id}`);
                        }}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-secondary">
                    No skills found matching search criteria.
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

export default AdminSkills;
