import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';
import { useDomain } from '../context/DomainContext';
import { useDashboardData } from '../context/DashboardDataContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { domain, setDomain } = useDomain();
  const {
    availableDomains,
    analyticsSummary,
    domainAnalytics,
    roleFit,
    roadmap,
    loadingStats,
    loadingRoleFit,
  } = useDashboardData();

  // Helper values for dynamic calculations
  const matchConfidence = roleFit ? Math.round(roleFit.confidence * 100) : 0;
  const confidenceRatio = roleFit ? roleFit.confidence : 0.5;

  // Dynamic topography curve calculation
  const curveY1 = 200 - Math.round(confidenceRatio * 30);
  const curveY2 = 150 - Math.round(confidenceRatio * 40);
  const curveY3 = 100 - Math.round(confidenceRatio * 50);

  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/20 pb-6">
          <div>
            <h1 className="text-headline-xl font-headline-xl text-on-surface mb-2 font-bold">Welcome back.</h1>
            <p className="text-body-lg font-body-lg text-secondary">Your career topography is shifting.</p>
          </div>
          
          {/* Domain selector with clear label and bordered container */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-surface-bright rounded-xl p-3 border border-outline-variant/40 elevation-1">
            <div className="flex items-center gap-1.5 text-data-sm font-data-sm font-bold text-secondary uppercase tracking-wider px-1">
              <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
              Viewing Domain:
            </div>
            <select 
              className="bg-surface border border-outline-variant/40 rounded-lg px-3 py-1.5 text-data-lg font-data-lg text-primary font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
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

        {/* AI Predicted Best-Fit Role Hero Section */}
        {loadingRoleFit ? (
           <div className="bg-surface rounded-2xl p-8 elevation-1 mb-8 flex items-center justify-center text-secondary border border-outline-variant/30">
             <span className="material-symbols-outlined animate-spin mr-3 text-primary text-[24px]">progress_activity</span> 
             Predicting your best-fit role...
           </div>
        ) : roleFit ? (
          <section className="bg-gradient-to-r from-primary/10 via-surface-bright to-surface rounded-2xl p-6 md:p-8 elevation-2 mb-8 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
            <div className="flex-1">
              <div className="text-data-sm font-bold text-primary mb-1 flex items-center gap-1.5 tracking-wider uppercase">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                AI Predicted Best-Fit Role
              </div>
              <h2 className="text-headline-xl font-headline-xl text-on-surface font-extrabold my-2">{roleFit.predicted_role}</h2>
              <p className="text-body-md text-on-surface-variant font-medium max-w-xl">
                This is the role your skills currently match best, out of the roles tracked in {domain || 'your domain'}.
              </p>
            </div>

            {/* Radial Match Score Progress Ring */}
            <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-highest"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray={`${matchConfidence}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-headline-md font-bold text-primary">{matchConfidence}%</span>
                  <span className="text-[10px] uppercase font-bold text-secondary tracking-tighter">Match</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/roadmap')} 
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-data-sm text-data-sm font-bold hover:bg-surface-tint transition-all duration-200 elevation-1 flex items-center gap-2 shadow-md hover:-translate-y-0.5"
              >
                Build Roadmap <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </section>
        ) : null}

        {/* 3-Stat Cards Grid (No Salary Display) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Jobs Analyzed */}
          <div className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-body-sm font-semibold text-secondary uppercase tracking-wider">Jobs Analyzed</span>
              <span className="material-symbols-outlined text-waypoint">radar</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-bold">
                {loadingStats ? '...' : domainAnalytics?.jobs || analyticsSummary?.total_jobs || 0}
              </span>
              <span className="text-secondary text-body-sm font-body-sm mb-2">in {domain}</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-4">
              <div className="bg-waypoint h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Card 2: Skills Matched (Replaced Avg Salary card) */}
          <div className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-body-sm font-semibold text-secondary uppercase tracking-wider">Skills Matched</span>
              <span className="material-symbols-outlined text-success">verified</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-bold">
                {loadingRoleFit ? '...' : (roadmap?.normalized_skills?.length || 0)}
              </span>
              <span className="text-secondary text-body-sm font-body-sm mb-2">active skills</span>
            </div>
            <div className="mt-4 flex gap-2 items-center">
              <span className="skill-chip px-2.5 py-1 bg-success/10 rounded text-data-sm font-bold text-success border border-success/20">
                {loadingRoleFit ? '...' : `${matchConfidence}% profile fit`}
              </span>
            </div>
          </div>

          {/* Card 3: Top Demand Skill */}
          <div 
            className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-transform border border-outline-variant/20" 
            onClick={() => {
              const topSkill = domainAnalytics?.top_skills?.[0]?.skill;
              navigate(`/skill-insight${topSkill ? `?skill=${encodeURIComponent(topSkill)}` : ''}`);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-body-sm font-semibold text-secondary uppercase tracking-wider">Top Demand Skill</span>
              <span className="material-symbols-outlined text-warning">local_fire_department</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-bold truncate">
                {loadingStats ? '...' : domainAnalytics?.top_skills?.[0]?.skill || 'None'}
              </span>
            </div>
            <div className="mt-4 flex gap-2 items-center">
              <span className="text-data-sm font-bold text-primary bg-primary-fixed px-2.5 py-1 rounded elevation-1">
                {loadingStats ? '...' : `Appears ${domainAnalytics?.top_skills?.[0]?.count || 0} times`}
              </span>
              <Link className="text-body-sm font-body-sm text-waypoint font-semibold hover:underline ml-auto" to="/skill-insight" onClick={(e) => e.stopPropagation()}>
                View courses
              </Link>
            </div>
          </div>
        </section>

        {/* Data-Driven Career Topography Graph */}
        <section className="bg-surface rounded-2xl p-1 elevation-1 mb-8 overflow-hidden border border-outline-variant/20">
          <div className="bg-surface-bright rounded-xl p-6 h-96 relative elevation-2 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 z-10">
              <div>
                <h2 className="text-headline-md font-headline-md text-on-surface font-bold">Career Topography</h2>
                <p className="text-body-sm text-secondary mt-1">
                  Your path from current skills ({roadmap?.normalized_skills?.length || 0}) to {roleFit?.predicted_role || 'target role'}, based on {roadmap?.missing_skills?.length || 0} missing skills.
                </p>
              </div>
              <button className="text-primary text-body-sm font-body-sm font-semibold flex items-center gap-1 hover:underline shrink-0" onClick={() => navigate('/roadmap')}>
                Detailed view <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </button>
            </div>

            {/* Topography Waypoints Container */}
            <div className="flex-1 relative w-full flex items-end justify-between px-8 pb-8 z-10">
              {/* Waypoint 1: Current Skills */}
              <div className="relative flex flex-col items-center w-1/4 group cursor-pointer">
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface text-data-sm font-data-sm px-3 py-1 rounded shadow-lg whitespace-nowrap z-20">
                  {roadmap?.normalized_skills?.slice(0, 3).join(', ') || 'Your Skills'}
                </div>
                <div className="w-8 h-8 rounded-full bg-surface border-4 border-primary elevation-1 z-10 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-primary/20 to-transparent mt-2 rounded-t-xl transition-all duration-500"
                  style={{ height: `${80 + Math.round(confidenceRatio * 40)}px` }}
                ></div>
                <span className="absolute -bottom-6 text-data-sm font-bold text-secondary">
                  Current ({roadmap?.normalized_skills?.length || 0})
                </span>
              </div>
              
              {/* Dynamic SVG Curve */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 300">
                <path 
                  className="contour-line" 
                  d={`M 125 220 C 300 ${curveY1}, 400 ${curveY2}, 500 ${curveY2} C 600 ${curveY2}, 750 ${curveY3}, 875 50`}
                ></path>
              </svg>

              {/* Waypoint 2: Next Waypoint */}
              <div className="relative flex flex-col items-center w-1/4 group cursor-pointer pb-8">
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface text-data-sm font-data-sm px-3 py-1 rounded shadow-lg whitespace-nowrap z-20">
                  {roadmap?.missing_skills?.[0]?.skill || 'Next Skill'}
                </div>
                <div className="w-7 h-7 rounded-full bg-surface border-2 border-waypoint elevation-1 z-10 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-shadow"></div>
                <div 
                  className="w-full bg-gradient-to-t from-waypoint/15 to-transparent mt-2 rounded-t-xl border-l border-r border-waypoint/10 transition-all duration-500"
                  style={{ height: `${100 + Math.round(confidenceRatio * 50)}px` }}
                ></div>
                <span className="absolute -bottom-6 text-data-sm font-semibold text-secondary text-center truncate max-w-full">
                  {roadmap?.missing_skills?.[0]?.skill || 'Next Skill'} ({roadmap?.missing_skills?.length || 0} left)
                </span>
              </div>

              {/* Waypoint 3: Target Role */}
              <div className="relative flex flex-col items-center w-1/4 group cursor-pointer pb-20">
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface text-data-sm font-data-sm px-3 py-1 rounded shadow-lg whitespace-nowrap z-20">
                  {roleFit?.predicted_role || 'Target Role'} ({matchConfidence}% Match)
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center elevation-1 z-10 shadow-[0_0_20px_rgba(70,72,212,0.4)]">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">flag</span>
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-tertiary/20 to-transparent mt-2 rounded-t-xl border-t border-tertiary/30 transition-all duration-500"
                  style={{ height: `${140 + Math.round(confidenceRatio * 60)}px` }}
                ></div>
                <span className="absolute -bottom-6 text-data-sm font-bold text-on-surface text-center w-full truncate">
                  {roleFit?.predicted_role || 'Target Role'}
                </span>
              </div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'radial-gradient(#191c1e 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
        </section>

        {/* Section: Top Hiring Companies & Missing Skills Checklist */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Card 1: Top Hiring Companies */}
          <div className="bg-surface rounded-2xl p-6 elevation-1 border border-outline-variant/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md font-headline-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">corporate_fare</span>
                Top Hiring Companies
              </h3>
              <span className="text-data-sm text-secondary font-semibold">{domain}</span>
            </div>
            <div className="flex flex-col gap-4">
              {loadingStats ? (
                <div className="text-secondary text-center p-4">Loading top companies...</div>
              ) : domainAnalytics?.top_companies?.length > 0 ? (
                domainAnalytics.top_companies.slice(0, 4).map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group border border-outline-variant/10 hover:border-outline-variant/30" onClick={() => navigate('/skill-insight')}>
                    <div className={`w-12 h-12 rounded-lg bg-surface-bright elevation-1 flex items-center justify-center font-headline-md font-bold ${idx === 0 ? 'text-primary' : idx === 1 ? 'text-waypoint' : 'text-secondary'}`}>
                      {comp.company.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-body-md font-body-md font-bold text-on-surface group-hover:text-primary transition-colors">{comp.company}</h4>
                      <p className="text-body-sm font-body-sm text-secondary">Active Hiring in {domain}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-data-lg font-data-lg text-success font-extrabold">{comp.count}</div>
                      <div className="text-data-sm font-data-sm text-secondary">Open Roles</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-secondary text-center p-6 border border-dashed border-outline-variant/50 rounded-xl">No company data available</div>
              )}
            </div>
          </div>
          
          {/* Card 2: Missing Skills Checklist (Replaced Duplicate Active Signals Table) */}
          <div className="bg-surface rounded-2xl p-6 elevation-1 flex flex-col border border-outline-variant/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md font-headline-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-waypoint">checklist</span>
                Missing Skills Checklist
              </h3>
              <button className="text-body-sm font-body-sm font-bold text-primary hover:underline" onClick={() => navigate('/roadmap')}>
                View Roadmap
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {roadmap?.missing_skills?.length > 0 ? (
                roadmap.missing_skills.slice(0, 4).map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surface-bright hover:bg-surface-container-high border border-outline-variant/20 transition-all cursor-pointer group"
                    onClick={() => navigate(`/skill-insight?skill=${encodeURIComponent(item.skill)}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-waypoint/10 text-waypoint flex items-center justify-center font-bold text-data-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-body-md group-hover:text-primary transition-colors">{item.skill}</h4>
                        <span className="text-data-sm text-secondary font-medium">Est. {item.estimated_learning_weeks || 1} weeks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-surface rounded text-data-sm font-bold text-waypoint border border-waypoint/20">
                        ROI: {Math.round(item.roi_score || 0)}
                      </span>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-secondary text-center py-8 border border-dashed border-outline-variant/50 rounded-xl my-auto">
                  <span className="material-symbols-outlined text-3xl mb-1 text-success block">check_circle</span>
                  No skill gaps identified yet. Upload your resume or complete your profile!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Action Banner */}
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
