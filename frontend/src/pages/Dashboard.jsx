import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';
import { fetchApi } from '../api/apiClient';
import { useDomain } from '../context/DomainContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { domain, setDomain } = useDomain();
  const { user } = useAuth(); // Optional if you want to display username
  
  const [availableDomains, setAvailableDomains] = useState([]);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [domainAnalytics, setDomainAnalytics] = useState(null);
  const [roleFit, setRoleFit] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [jobs, setJobs] = useState([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRoleFit, setLoadingRoleFit] = useState(false);

  // Initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const summary = await fetchApi('/analytics');
        setAnalyticsSummary(summary);
        setAvailableDomains(summary.available_domains || []);
        
        // Set initial domain only if domain is not already set to a valid option
        const validDomains = summary.available_domains || [];
        const currentDomainValid = domain && validDomains.some(d => d.toLowerCase() === domain.trim().toLowerCase());

        if (!currentDomainValid) {
          const userPreferredDomain = user?.profile?.preferred_field;
          const isUserDomainValid = userPreferredDomain && validDomains.some(d => d.toLowerCase() === userPreferredDomain.trim().toLowerCase());

          if (isUserDomainValid) {
            setDomain(userPreferredDomain);
          } else if (validDomains.length > 0) {
            setDomain(validDomains[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load analytics summary:", error);
      }
    };
    fetchInitialData();
  }, [user?.profile?.preferred_field]);

  // Fetch domain specific data
  useEffect(() => {
    if (!domain) return;
    
    const fetchDomainData = async () => {
      setLoadingStats(true);
      try {
        const data = await fetchApi(`/analytics/domain/${encodeURIComponent(domain)}`);
        setDomainAnalytics(data);
      } catch (error) {
        console.error(`Failed to load analytics for ${domain}:`, error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDomainData();
  }, [domain]);

  useEffect(() => {
    if (!domain) return;
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const data = await fetchApi(`/jobs?domain=${encodeURIComponent(domain)}`);
        setJobs(data || []);
      } catch (error) {
        console.error(`Failed to load jobs for ${domain}:`, error);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [domain]);

  // Fetch Role Fit & Recommendations using user's real profile skills
  useEffect(() => {
    const fetchRoleFit = async () => {
      const userSkills =
        user?.profile?.skills && user.profile.skills.length > 0
          ? user.profile.skills
          : (() => {
              try {
                const stored = localStorage.getItem('extractedResume');
                return stored ? JSON.parse(stored).skills || [] : [];
              } catch {
                return [];
              }
            })();

      if (userSkills && userSkills.length > 0) {
        setLoadingRoleFit(true);
        try {
          const uniqueSkills = [...new Set(userSkills.map((s) => s.toLowerCase()))];
          const fit = await fetchApi('/role-fit', {
            method: 'POST',
            body: JSON.stringify({ resume_skills: uniqueSkills }),
          });
          setRoleFit(fit);

          const targetDom = domain || user?.profile?.preferred_field;
          if (targetDom) {
            const rec = await fetchApi('/recommendation', {
              method: 'POST',
              body: JSON.stringify({
                resume_skills: uniqueSkills,
                target_domain: targetDom,
              }),
            });
            setRoadmap(rec);
          }
        } catch (error) {
          console.error("Failed to predict role fit:", error);
        } finally {
          setLoadingRoleFit(false);
        }
      } else {
        setRoleFit(null);
        setRoadmap(null);
      }
    };
    fetchRoleFit();
  }, [user?.profile?.skills, domain]);

  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-headline-xl font-headline-xl text-on-surface mb-2">Welcome back.</h1>
            <p className="text-body-lg font-body-lg text-secondary">Your career topography is shifting.</p>
          </div>
          <div className="flex items-center gap-3 elevation-2 bg-surface rounded-lg px-4 py-2 border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline">tune</span>
            <select 
              className="bg-transparent border-none text-data-lg font-data-lg text-primary font-semibold focus:ring-0 cursor-pointer pl-0 pr-8 outline-none"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              {availableDomains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
              {availableDomains.length === 0 && <option>{domain}</option>}
            </select>
          </div>
        </header>

        {/* Best Fit Role Section */}
        {loadingRoleFit ? (
           <div className="bg-surface rounded-xl p-6 elevation-1 mb-8 flex items-center justify-center text-secondary">
             <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> Predicting your best-fit role...
           </div>
        ) : roleFit ? (
          <section className="bg-surface rounded-xl p-6 elevation-1 mb-8 border-l-4 border-waypoint flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-body-sm font-body-sm text-secondary mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                AI Predicted Best-Fit Role
              </div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface">{roleFit.predicted_role}</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Based on your extracted skills and the {roleFit.domain} domain.</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-data-lg font-data-lg text-success font-semibold">{Math.round(roleFit.confidence * 100)}% Match</div>
              <button onClick={() => navigate('/roadmap')} className="mt-2 text-primary font-body-sm hover:underline flex items-center gap-1">
                Build Roadmap <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-body-sm text-secondary">Jobs Analyzed</span>
              <span className="material-symbols-outlined text-waypoint">radar</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-data-lg">
                {loadingStats ? '...' : domainAnalytics?.jobs || analyticsSummary?.total_jobs || 0}
              </span>
              <span className="text-secondary text-body-sm font-body-sm mb-2">in {domain}</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-4 elevation-2">
              <div className="bg-waypoint h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-body-sm text-secondary">Avg Salary (Disclosed)</span>
              <span className="material-symbols-outlined text-success">payments</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-headline-lg font-headline-lg text-on-surface font-data-lg">
                {loadingStats ? '...' : (
                  domainAnalytics?.salary_statistics?.average_salary_max 
                  ? `₹${Math.round(domainAnalytics.salary_statistics.average_salary_max / 1000)}k` 
                  : 'N/A'
                )}
              </span>
              <span className="text-secondary text-body-sm font-body-sm mb-1">max avg</span>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="skill-chip px-2 py-1 bg-surface rounded text-data-sm font-data-sm text-secondary elevation-1 border border-outline-variant/20">
                {loadingStats ? '...' : `${domainAnalytics?.salary_statistics?.disclosure_rate_percent || 0}% disclosure rate`}
              </span>
            </div>
          </div>
          <div 
            className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-transform" 
            onClick={() => {
              const topSkill = domainAnalytics?.top_skills?.[0]?.skill;
              navigate(`/skill-insight${topSkill ? `?skill=${encodeURIComponent(topSkill)}` : ''}`);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-body-sm text-secondary">Top Demand Skill</span>
              <span className="material-symbols-outlined text-warning">local_fire_department</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-data-lg truncate">
                {loadingStats ? '...' : domainAnalytics?.top_skills?.[0]?.skill || 'None'}
              </span>
            </div>
            <div className="mt-4 flex gap-2 items-center">
              <span className="text-data-sm font-data-sm text-primary bg-primary-fixed px-2 py-1 rounded elevation-2">
                {loadingStats ? '...' : `Appears ${domainAnalytics?.top_skills?.[0]?.count || 0} times`}
              </span>
              <Link className="text-body-sm font-body-sm text-waypoint hover:underline ml-auto" to="/skill-insight" onClick={(e) => e.stopPropagation()}>View courses</Link>
            </div>
          </div>
        </section>

        <section className="bg-surface rounded-xl p-1 elevation-1 mb-8 overflow-hidden">
          <div className="bg-surface-bright rounded-lg p-6 h-96 relative elevation-2 flex flex-col">
            <div className="flex justify-between items-center mb-6 z-10">
              <h2 className="text-headline-md font-headline-md text-on-surface">Career Topography</h2>
              <button className="text-primary text-body-sm font-body-sm flex items-center gap-1 hover:underline" onClick={() => navigate('/roadmap')}>
                Detailed view <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </button>
            </div>
            <div className="flex-1 relative w-full h-full flex items-end justify-between px-8 pb-8 z-10">
              <div className="relative flex flex-col items-center w-1/4 group cursor-pointer">
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface text-data-sm font-data-sm px-3 py-1 rounded shadow-lg whitespace-nowrap z-20">
                  {roadmap?.normalized_skills?.slice(0, 3).join(', ') || 'Your Skills'}
                </div>
                <div className="w-8 h-8 rounded-full bg-surface border-4 border-primary elevation-1 z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="w-full h-32 bg-gradient-to-t from-primary/20 to-transparent mt-2 rounded-t-xl"></div>
                <span className="absolute -bottom-6 text-data-sm font-data-sm text-secondary">Current Skills</span>
              </div>
              
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 300">
                <path className="contour-line" d="M 125 200 C 300 200, 400 150, 500 120 C 600 90, 750 80, 875 50"></path>
              </svg>

              <div className="relative flex flex-col items-center w-1/4 group cursor-pointer pb-16">
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface text-data-sm font-data-sm px-3 py-1 rounded shadow-lg whitespace-nowrap z-20">
                  {roadmap?.missing_skills?.[0]?.skill || 'Next Skill'}
                </div>
                <div className="w-6 h-6 rounded-full bg-surface border-2 border-waypoint elevation-1 z-10 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-shadow"></div>
                <div className="w-full h-24 bg-gradient-to-t from-waypoint/10 to-transparent mt-2 rounded-t-xl border-l border-r border-waypoint/10"></div>
                <span className="absolute -bottom-6 text-data-sm font-data-sm text-secondary text-center">Next Waypoint</span>
              </div>

              <div className="relative flex flex-col items-center w-1/4 group cursor-pointer pb-32">
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface text-data-sm font-data-sm px-3 py-1 rounded shadow-lg whitespace-nowrap z-20">
                  {roleFit?.predicted_role || 'Target Role'}
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center elevation-1 z-10 shadow-[0_0_20px_rgba(70,72,212,0.4)]">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">flag</span>
                </div>
                <div className="w-full h-48 bg-gradient-to-t from-tertiary/20 to-transparent mt-2 rounded-t-xl border-t border-tertiary/30"></div>
                <span className="absolute -bottom-6 text-data-sm font-data-sm text-on-surface font-semibold text-center w-full">
                  {roleFit?.predicted_role || 'Target Role'}
                </span>
              </div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'radial-gradient(#191c1e 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface rounded-xl p-6 elevation-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">corporate_fare</span>
                Top Hiring Companies
              </h3>
              <button className="text-secondary hover:text-primary transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
            </div>
            <div className="flex flex-col gap-4">
              {loadingStats ? (
                <div className="text-secondary text-center p-4">Loading top companies...</div>
              ) : domainAnalytics?.top_companies?.length > 0 ? (
                domainAnalytics.top_companies.slice(0, 3).map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer group border border-transparent hover:border-outline-variant/20" onClick={() => navigate('/skill-insight')}>
                    <div className={`w-12 h-12 rounded bg-surface-bright elevation-2 flex items-center justify-center font-headline-md font-bold ${idx === 0 ? 'text-primary' : idx === 1 ? 'text-waypoint' : 'text-secondary'}`}>
                      {comp.company.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-body-md font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">{comp.company}</h4>
                      <p className="text-body-sm font-body-sm text-secondary">Active Hiring</p>
                    </div>
                    <div className="text-right">
                      <div className="text-data-lg font-data-lg text-success font-semibold">{comp.count}</div>
                      <div className="text-data-sm font-data-sm text-secondary">Jobs</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-secondary text-center p-4 border border-dashed border-outline-variant/50 rounded-lg">No company data available</div>
              )}
            </div>
          </div>
          
          <div className="bg-surface rounded-xl p-6 elevation-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-waypoint">work</span>
                Active Signals
              </h3>
              <button className="text-body-sm font-body-sm text-primary hover:underline" onClick={() => navigate('/pathfinder')}>View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-data-sm font-data-sm text-secondary border-b border-outline-variant/30">
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Comp Range</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm font-body-sm">
                  {loadingJobs ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-secondary">Loading jobs...</td>
                    </tr>
                  ) : jobs.length > 0 ? (
                    jobs.slice(0, 4).map((job, idx) => (
                      <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-on-surface">{job.title}</div>
                          <div className="text-secondary text-data-sm font-data-sm">{job.location} • {job.company}</div>
                        </td>
                        <td className="py-3 font-data-lg text-on-surface-variant">
                          {job.salary_min && job.salary_max
                            ? `₹${Math.round(job.salary_min / 1000)}k - ₹${Math.round(job.salary_max / 1000)}k`
                            : 'Not Disclosed'}
                        </td>
                        <td className="py-3 text-right">
                          <button className="text-primary hover:bg-primary-fixed p-2 rounded-full transition-colors inline-flex" onClick={() => navigate('/dashboard')}><span className="material-symbols-outlined text-[20px]">bookmark_add</span></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-secondary border border-dashed border-outline-variant/50 rounded-lg">No active jobs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="flex justify-center my-12">
          <button className="bg-primary text-on-primary px-8 py-4 rounded-xl text-headline-md font-headline-md font-bold elevation-1 hover:bg-surface-tint hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-3" onClick={() => navigate('/roadmap')}>
            <span className="material-symbols-outlined text-[28px]">route</span>
            Generate My Roadmap
          </button>
        </section>
      </main>

      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        <div className="bg-inverse-surface text-inverse-on-surface text-body-sm font-body-sm px-4 py-2 rounded-lg elevation-1 mb-2 hidden md:block">
            Need mapping assistance?
        </div>
        <button className="w-16 h-16 bg-tertiary text-on-tertiary rounded-full elevation-1 flex items-center justify-center hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(113,42,226,0.4)]" onClick={() => alert('How can I help you with your career topography today?')}>
          <span className="material-symbols-outlined text-[32px]">forum</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
