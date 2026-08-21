import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { fetchApi } from '../../api/apiClient';

const parseDescriptionToBullets = (text) => {
  if (!text) return [];
  
  const rawText = text.trim();
  const isTruncated = rawText.endsWith('...') || rawText.endsWith('…');
  
  let cleaned = rawText;
  if (isTruncated) {
    cleaned = cleaned.replace(/\.\.\.$|…$/, '').trim();
  }

  let results = [];

  // Check for bullet characters first
  const bulletRegex = /▶|•|·|▪/;
  if (bulletRegex.test(cleaned)) {
    results = cleaned.split(bulletRegex)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  } else if (cleaned.includes('\n')) {
    // Check for explicit newlines
    const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let bullets = [];
    lines.forEach(line => {
      let l = line;
      if (l.startsWith('-')) l = l.substring(1).trim();
      if (l) bullets.push(l);
    });
    if (bullets.length > 1) {
      results = bullets;
    }
  }

  if (results.length === 0) {
    // Fallback: split on sentence boundaries
    const sentences = cleaned.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 0);
    results = sentences.map(s => {
      if (!s.match(/[.!?]$/)) return s + '.';
      return s;
    });
  }

  // If the text was truncated, the last item is incomplete. Remove it.
  if (isTruncated && results.length > 1) {
    results.pop();
  }

  return results;
};

const AdminJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(location.state?.job || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setLoading(false);
      return;
    }
    const loadJob = async () => {
      try {
        if (id.includes('::')) {
          const decodedId = decodeURIComponent(id);
          const [title, company, city] = decodedId.split('::');
          
          const jobs = await fetchApi(`/jobs?company=${encodeURIComponent(company)}&limit=100`);
          const found = jobs.find(j => 
            j.title === title && 
            j.company === company && 
            (city ? j.city === city : true)
          );
          
          if (found) {
            setJob(found);
          } else {
            setError('Job posting record not found.');
          }
        } else {
          // Fallback for legacy index-based routing
          const jobs = await fetchApi('/jobs?limit=100');
          const index = parseInt(id, 10);
          if (jobs && jobs[index]) {
            setJob(jobs[index]);
          } else if (jobs && jobs.length > 0) {
            setJob(jobs[0]);
          } else {
            setError('Job posting record not found.');
          }
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
        setError('Error retrieving job specifications.');
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id, job]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/jobs')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-data-sm text-data-sm mb-4"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Jobs Catalog
        </button>

        {error ? (
          <div className="bg-error-container text-on-error-container p-6 rounded-xl text-body-sm">
            {error}
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-secondary bg-surface-container-lowest rounded-xl">
            <span className="material-symbols-outlined animate-spin align-middle mr-2">progress_activity</span>
            Loading job record...
          </div>
        ) : job ? (
          <>
            {/* Header Entity Card */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{job.title}</h2>
                  <span className="px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/30 font-data-sm text-xs font-bold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5"></span> Verified Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center text-on-surface-variant font-body-md text-body-md gap-4">
                  <span className="flex items-center gap-1 font-semibold text-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-primary">domain</span> {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span> {job.city || 'Remote'}, {job.state || 'India'}
                  </span>
                </div>
              </div>
              <div className="bg-surface shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] px-6 py-4 rounded-xl min-w-[220px]">
                <div className="font-data-sm text-xs text-secondary font-bold uppercase mb-1">Extracted Skills</div>
                <div className="font-data-lg text-[22px] font-bold text-primary">
                  {job.skill_count || 0} Skills
                </div>
                <div className="font-data-sm text-xs text-on-surface-variant opacity-75 mt-0.5">Required Competencies</div>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Specifications & Taxonomy */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <h3 className="font-data-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
                    Market Classification
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-data-sm text-xs text-secondary mb-0.5">Career Domain</p>
                      <p className="font-data-md text-on-surface font-semibold">{job.career_domain}</p>
                    </div>
                    <div>
                      <p className="font-data-sm text-xs text-secondary mb-0.5">Adzuna Category</p>
                      <p className="font-data-md text-on-surface font-semibold">{job.adzuna_category || 'IT & Technical'}</p>
                    </div>
                    <div>
                      <p className="font-data-sm text-xs text-secondary mb-0.5">Index Date</p>
                      <p className="font-data-md text-on-surface font-semibold">{job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Active'}</p>
                    </div>
                  </div>
                </div>

                {/* Skills Requirements */}
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <h3 className="font-data-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
                    Matched Skills Matrix ({job.skill_count || 0})
                  </h3>
                  <div className="space-y-3">
                    {job.skills?.technical && job.skills.technical.length > 0 && (
                      <div>
                        <p className="font-data-sm text-[11px] text-primary font-bold uppercase mb-1.5">Technical</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.technical.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-surface rounded text-xs font-data-sm text-on-surface border border-outline-variant/30">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {job.skills?.domain && job.skills.domain.length > 0 && (
                      <div>
                        <p className="font-data-sm text-[11px] text-tertiary font-bold uppercase mb-1.5 mt-3">Domain</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.domain.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-surface rounded text-xs font-data-sm text-on-surface border border-outline-variant/30">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {job.skills?.soft && job.skills.soft.length > 0 && (
                      <div>
                        <p className="font-data-sm text-[11px] text-secondary font-bold uppercase mb-1.5 mt-3">Soft Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.soft.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-surface rounded text-xs font-data-sm text-on-surface border border-outline-variant/30">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Full Description */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
                  <h3 className="font-data-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
                    Job Description &amp; Scope
                  </h3>
                  <div className="prose max-w-none text-body-md text-on-surface leading-relaxed bg-surface-bright p-6 rounded-xl border border-outline-variant/20 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2)]">
                    {job.description ? (
                      <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                        {parseDescriptionToBullets(job.description).map((bullet, idx) => (
                          <li key={idx} className="pl-1">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'No extended text description provided for this listing.'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminJobDetail;
