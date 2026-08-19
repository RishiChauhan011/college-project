import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const AdminSkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingJobs, setMatchingJobs] = useState([]);

  useEffect(() => {
    const loadSkillData = async () => {
      setLoading(true);
      try {
        const skillsList = await fetchApi('/skills');
        const found = skillsList?.find(
          (s) => s.id === id || s.name.toLowerCase() === decodeURIComponent(id || '').toLowerCase()
        );
        setSkill(found || { id: id, name: id, category: 'Technical', skill_type: 'General' });

        if (found?.name) {
          const jobs = await fetchApi(`/jobs?skills=${encodeURIComponent(found.name)}&limit=10`);
          setMatchingJobs(jobs || []);
        }
      } catch (err) {
        console.error('Failed to load skill detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSkillData();
  }, [id]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/skills')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-data-sm text-data-sm mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Skills Directory
        </button>

        {loading ? (
          <div className="p-8 text-center text-secondary bg-surface-container-lowest rounded-xl">
            <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
            Loading skill telemetry...
          </div>
        ) : skill ? (
          <>
            {/* Entity Header */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-container text-white font-headline-lg font-bold flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)]">
                  {skill.id || 'SK'}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{skill.name}</h2>
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-data-sm text-xs font-bold border border-primary/20">
                      ID: {skill.id}
                    </span>
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant">
                    Master Competency Taxonomy • {skill.category} • {skill.skill_type || 'Core'}
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-status-success/10 border border-status-success/30 flex items-center gap-1.5 font-data-sm text-xs font-bold text-status-success">
                <span className="w-2 h-2 rounded-full bg-status-success"></span> Verified Active
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Category</h3>
                <div className="font-data-lg text-[22px] font-bold text-primary">{skill.category}</div>
                <p className="font-data-sm text-xs text-secondary mt-1">High-level domain classification</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Skill Subtype</h3>
                <div className="font-data-lg text-[22px] font-bold text-on-surface">{skill.skill_type || 'General Standard'}</div>
                <p className="font-data-sm text-xs text-secondary mt-1">Granular competence type</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                <h3 className="font-data-sm text-xs font-bold text-secondary uppercase tracking-wider mb-2">Active Jobs Demand</h3>
                <div className="font-data-lg text-[22px] font-bold text-success">{matchingJobs.length}+ Roles</div>
                <p className="font-data-sm text-xs text-secondary mt-1">Directly requiring this skill</p>
              </div>
            </div>

            {/* Matching Roles Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] overflow-hidden">
              <div className="p-4 border-b border-outline-variant/30 bg-surface-bright flex justify-between items-center">
                <h3 className="font-data-sm text-xs font-bold text-on-surface uppercase tracking-wider">
                  Associated Market Positions Requiring {skill.name}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface border-b border-outline-variant/30 text-on-surface-variant font-data-sm text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Role Title</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Domain</th>
                      <th className="py-3 px-4 text-right">Compensation</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {matchingJobs.length > 0 ? (
                      matchingJobs.map((j, idx) => (
                        <tr
                          key={idx}
                          onClick={() => navigate(`/admin/jobs/${idx}`)}
                          className="border-b border-outline-variant/20 hover:bg-surface-bright cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-primary">{j.title}</td>
                          <td className="py-3 px-4 text-on-surface">{j.company}</td>
                          <td className="py-3 px-4 font-data-sm text-xs text-secondary">{j.career_domain}</td>
                          <td className="py-3 px-4 text-right font-data-md font-semibold">
                            {j.salary_max ? `$${Math.round(j.salary_min / 1000)}k - $${Math.round(j.salary_max / 1000)}k` : 'Undisclosed'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-secondary">
                          No direct job sample matches for this skill in the current query batch.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminSkillDetail;
