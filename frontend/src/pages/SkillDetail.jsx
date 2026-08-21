import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SideNavBar from "../components/SideNavBar";
import { useDomain } from "../context/DomainContext";
import { useDashboardData } from "../context/DashboardDataContext";

const SkillDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { domain } = useDomain();
  const { roadmap, domainAnalytics } = useDashboardData();

  const searchParams = new URLSearchParams(location.search);
  const skillParam = searchParams.get("skill");

  const [loading, setLoading] = useState(true);
  const [domainData, setDomainData] = useState(domainAnalytics || null);
  const [skillData, setSkillData] = useState(null);
  const [currentDomain, setCurrentDomain] = useState(domain || "");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (domainAnalytics) {
      setDomainData(domainAnalytics);
      setCurrentDomain(domain || "");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [domainAnalytics, domain]);

  useEffect(() => {
    if (domainData) {
      if (skillParam) {
        const found = domainData.top_skills?.find(
          (s) => s.skill.toLowerCase() === skillParam.toLowerCase()
        );
        setSkillData(found || { skill: skillParam, count: 0 });
      } else if (domainData.top_skills?.length > 0) {
        setSkillData(domainData.top_skills[0]);
      } else {
        setSkillData(null);
      }
    } else if (skillParam) {
      setSkillData({ skill: skillParam, count: 0 });
    }
  }, [domainData, skillParam]);

  if (loading) {
    return (
      <div className="bg-surface text-on-surface font-body-md antialiased pt-20 lg:pl-64 min-h-screen">
        <Navbar />
        <SideNavBar />
        <main className="max-w-[container-max] mx-auto p-margin-mobile md:p-gutter pb-32 flex justify-center items-center h-64">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </main>
      </div>
    );
  }

  if (error || (!loading && !skillData)) {
    return (
      <div className="bg-surface text-on-surface font-body-md antialiased pt-20 lg:pl-64 min-h-screen">
        <Navbar />
        <SideNavBar />
        <main className="max-w-[container-max] mx-auto p-margin-mobile md:p-gutter pb-32">
          <div
            className="mb-6 flex items-center gap-2 text-primary hover:text-primary-container cursor-pointer transition-colors w-fit"
            onClick={() => navigate("/dashboard")}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-data-sm font-data-sm font-bold">Back to Dashboard</span>
          </div>
          <div className="bg-surface-bright rounded-2xl p-12 text-center shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] border border-outline-variant/30 flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl text-error">error</span>
            <h2 className="text-headline-md font-headline-md text-on-surface max-w-lg">
              {error || "Select a skill to view its market insight"}
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-md">
              Navigate from the Dashboard or choose a valid career domain in your profile.
            </p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => navigate("/profile/edit")}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-data-sm text-data-sm hover:bg-surface-tint transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile Domain
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-surface text-on-surface px-6 py-2.5 rounded-lg font-data-sm text-data-sm border border-outline-variant hover:bg-surface-container-low transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const missingItem = roadmap?.missing_skills?.find(
    (item) => item.skill.toLowerCase() === (skillData?.skill || "").toLowerCase()
  );
  const isRecognized = roadmap?.recognized_skills?.some(
    (s) => s.toLowerCase() === (skillData?.skill || "").toLowerCase()
  );

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased pt-20 lg:pl-64 min-h-screen">
      <Navbar showNavLinks={false} />
      <SideNavBar />

      <main className="max-w-[container-max] mx-auto p-margin-mobile md:p-gutter pb-32">
        <div
          className="mb-6 flex items-center gap-2 text-primary hover:text-primary-container cursor-pointer transition-colors w-fit"
          onClick={() => navigate("/dashboard")}
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span className="text-data-sm font-data-sm font-bold">Back to Analysis</span>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-xl elevation-1 flex items-center justify-center bg-surface-bright text-primary shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
                <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>schema</span>
              </div>
              <div>
                <h1 className="text-headline-xl font-headline-xl text-on-surface mb-1">{skillData.skill}</h1>
                <div className="flex items-center gap-3">
                  <span className="bg-surface-tint text-on-primary px-3 py-1 rounded-full text-data-sm font-data-sm flex items-center gap-1 shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    Market Demand
                  </span>
                  <span className="text-data-sm font-data-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">category</span>
                    {currentDomain || "General"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Metric Cards */}
          <div className="md:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Demand Card (Always Available) */}
              <div className="rounded-xl p-6 bg-surface-bright flex flex-col justify-between relative overflow-hidden group shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] border border-outline-variant/20">
                <div className="absolute -right-4 -top-4 text-surface-container opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>bar_chart</span>
                </div>
                <div className="z-10">
                  <div className="text-data-sm font-data-sm text-outline mb-2 uppercase tracking-wider font-bold">Demand</div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-xl font-headline-xl text-on-surface font-extrabold">
                      {skillData?.count || 0}
                    </span>
                    <span className="text-data-sm font-bold text-secondary mb-1">job openings</span>
                  </div>
                  <p className="text-data-sm font-semibold text-secondary mt-1">Appears in {skillData?.count || 0} job listings</p>
                </div>
                <div className="z-10 mt-4 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-full"></div>
                </div>
              </div>

              {/* ROI Card / CTA Banner */}
              {missingItem ? (
                <div className="rounded-xl p-6 bg-surface-bright flex flex-col justify-between relative overflow-hidden group border-l-4 border-waypoint shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
                  <div className="absolute -right-4 -top-4 text-surface-container opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>rocket_launch</span>
                  </div>
                  <div className="z-10">
                    <div className="text-data-sm font-data-sm text-outline mb-2 uppercase tracking-wider font-bold">ROI Score</div>
                    <div className="text-headline-xl font-headline-xl text-waypoint font-extrabold">
                      {Math.round(missingItem.roi_score || 0)}
                    </div>
                    <p className="text-data-sm font-semibold text-secondary mt-1">Priority skill-gap item</p>
                  </div>
                  <div className="z-10 mt-4 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-waypoint rounded-full"
                      style={{ width: `${Math.min(100, Math.round(missingItem.roi_score || 0))}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => navigate('/roadmap')}
                  className="rounded-xl p-6 bg-gradient-to-r from-success/10 via-surface-bright to-surface flex items-center justify-between border border-success/20 shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] cursor-pointer hover:border-success/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-success text-2xl">check_circle</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-body-md group-hover:text-primary transition-colors">
                        Already strong here
                      </h4>
                      <p className="text-body-sm text-secondary">
                        See what's next on your roadmap →
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Market Analysis */}
          <div className="md:col-span-12 flex flex-col gap-gutter">
            <section className="rounded-xl p-8 bg-surface-bright shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
              <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderBottom: "1px solid #c7c4d7" }}>
                <span className="material-symbols-outlined text-tertiary">smart_toy</span>
                <h2 className="text-headline-md font-headline-md text-on-surface">Market Analysis</h2>
              </div>
              <div className="prose prose-sm max-w-none text-body-md font-body-md text-on-surface-variant space-y-4">
                <p>
                  <strong>{skillData.skill}</strong> is a high-demand skill in the{" "}
                  <strong>{currentDomain || "industry"}</strong> landscape. It appears in{" "}
                  <strong>{skillData.count}</strong> job listings in our current dataset,
                  making it one of the most sought-after competencies for employers.
                </p>
                <div className="p-4 rounded-lg bg-surface border-l-2 border-primary my-6 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
                  <p className="text-data-lg font-data-lg text-on-surface m-0">
                    "Employer data confirms strong and sustained demand for {skillData.skill} expertise."
                  </p>
                </div>
                <p>
                  Focusing on {skillData.skill} positions you well for roles within the{" "}
                  {currentDomain} domain. Consider hands-on projects and certifications to validate this expertise.
                </p>
              </div>
            </section>

            {/* Other top skills in domain */}
            {domainData?.top_skills && domainData.top_skills.length > 1 && (
              <section className="rounded-xl p-8 bg-surface-bright shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderBottom: "1px solid #c7c4d7" }}>
                  <span className="material-symbols-outlined text-primary">account_tree</span>
                  <h2 className="text-headline-md font-headline-md text-on-surface">Related Skills in Domain</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {domainData.top_skills
                    .filter((s) => s.skill !== skillData.skill)
                    .slice(0, 6)
                    .map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-surface rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer border border-transparent hover:border-primary/30 transition-all duration-200 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:text-primary shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]"
                        onClick={() => navigate(`/skill-insight?skill=${encodeURIComponent(s.skill)}`)}
                      >
                        <span className="material-symbols-outlined text-sm text-outline">deployed_code</span>
                        <span className="text-data-lg font-data-lg">{s.skill}</span>
                        <span className="bg-surface-container text-data-sm font-data-sm px-2 py-0.5 rounded ml-2">
                          {s.count} jobs
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillDetail;
