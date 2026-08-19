import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';

const SkillDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased pt-20 lg:pl-64 min-h-screen">
      <Navbar />
      <SideNavBar />

      <main className="max-w-[container-max] mx-auto p-margin-mobile md:p-gutter pb-32">
        <div className="mb-6 flex items-center gap-2 text-primary hover:text-primary-container cursor-pointer transition-colors w-fit" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined text-sm" data-icon="arrow_back">arrow_back</span>
          <span className="text-data-sm font-data-sm font-bold">Back to Analysis</span>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-xl elevation-1 flex items-center justify-center bg-surface-bright text-primary shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
                <span className="material-symbols-outlined" data-icon="schema" style={{ fontSize: '32px' }}>schema</span>
              </div>
              <div>
                <h1 className="text-headline-xl font-headline-xl text-on-surface mb-1">Kubernetes</h1>
                <div className="flex items-center gap-3">
                  <span className="bg-surface-tint text-on-primary px-3 py-1 rounded-full text-data-sm font-data-sm flex items-center gap-1 shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
                    <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span>
                    #1 in Demand
                  </span>
                  <span className="text-data-sm font-data-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" data-icon="category">category</span>
                    Cloud Infrastructure
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 flex items-center justify-center bg-surface-bright w-full md:w-64 h-24 relative overflow-hidden shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIj48cGF0aCBkPSJNMCA1MCBRIDI1IDMwIDUwIDUwIFQgMTAwIDUwIFQgMTUwIDUwIFQgMjAwIDUwIiBzdHJva2U9IiM0NjQ4ZDQiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] bg-repeat-x bg-center"></div>
            <div className="z-10 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-waypoint shadow-[0_0_10px_rgba(99,102,241,0.5)] border-2 border-surface relative z-10"></div>
              <span className="text-data-sm font-data-sm text-waypoint mt-2 font-bold bg-surface/80 px-2 rounded">Current Target</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="rounded-xl p-6 bg-surface-bright flex flex-col justify-between relative overflow-hidden group shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
              <div className="absolute -right-4 -top-4 text-surface-container opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined" data-icon="bar_chart" style={{ fontSize: '120px' }}>bar_chart</span>
              </div>
              <div className="z-10">
                <div className="text-data-sm font-data-sm text-outline mb-2 uppercase tracking-wider">Demand Score</div>
                <div className="flex items-end gap-2">
                  <span className="text-headline-xl font-headline-xl text-on-surface">98</span>
                  <span className="text-data-lg font-data-lg text-outline mb-1">/100</span>
                </div>
              </div>
              <div className="z-10 mt-4 h-2 bg-surface-container rounded-full overflow-hidden shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
                <div className="h-full bg-primary w-[98%] rounded-full"></div>
              </div>
            </div>

            <div className="rounded-xl p-6 bg-surface-bright flex flex-col justify-between relative overflow-hidden group shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
              <div className="absolute -right-4 -top-4 text-surface-container opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined" data-icon="payments" style={{ fontSize: '120px' }}>payments</span>
              </div>
              <div className="z-10">
                <div className="text-data-sm font-data-sm text-outline mb-2 uppercase tracking-wider">Salary Impact</div>
                <div className="flex items-center gap-2">
                  <span className="text-headline-xl font-headline-xl text-success">+$22k</span>
                  <span className="material-symbols-outlined text-success" data-icon="trending_up">trending_up</span>
                </div>
              </div>
              <div className="z-10 mt-4 text-data-sm font-data-sm text-on-surface-variant bg-surface px-3 py-2 rounded-lg w-fit shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
                Avg. base increase for Senior AI roles
              </div>
            </div>

            <div className="rounded-xl p-6 bg-surface-bright flex flex-col justify-between relative overflow-hidden group border-l-4 border-waypoint shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
              <div className="absolute -right-4 -top-4 text-surface-container opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined" data-icon="rocket_launch" style={{ fontSize: '120px' }}>rocket_launch</span>
              </div>
              <div className="z-10">
                <div className="text-data-sm font-data-sm text-outline mb-2 uppercase tracking-wider">ROI Score</div>
                <div className="text-headline-xl font-headline-xl text-waypoint">Extreme</div>
              </div>
              <div className="z-10 mt-4 flex gap-1">
                <div className="h-2 flex-1 bg-waypoint rounded-l-full"></div>
                <div className="h-2 flex-1 bg-waypoint"></div>
                <div className="h-2 flex-1 bg-waypoint"></div>
                <div className="h-2 flex-1 bg-waypoint"></div>
                <div className="h-2 flex-1 bg-waypoint rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col gap-gutter">
            <section className="rounded-xl p-8 bg-surface-bright shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
              <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderBottom: '1px solid #c7c4d7' }}>
                <span className="material-symbols-outlined text-tertiary" data-icon="smart_toy">smart_toy</span>
                <h2 className="text-headline-md font-headline-md text-on-surface">AI Path Analysis</h2>
              </div>
              <div className="prose prose-sm max-w-none text-body-md font-body-md text-on-surface-variant space-y-4">
                <p>
                  For a Senior AI Architect, mastering Kubernetes is no longer optional—it is the foundational infrastructure waypoint. While model development is crucial, the ability to deploy, scale, and manage those models in production environments is currently the most significant bottleneck for enterprises.
                </p>
                <div className="p-4 rounded-lg bg-surface border-l-2 border-primary my-6 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
                  <p className="text-data-lg font-data-lg text-on-surface m-0">
                    "The gap between a data scientist and an AI Architect is often measured in orchestration capability."
                  </p>
                </div>
                <p>
                  Acquiring this skill acts as a multiplier. It allows you to bridge the gap between abstract ML concepts and concrete, scalable cloud solutions, directly leading to the 'Extreme' ROI rating for your specific trajectory.
                </p>
              </div>
            </section>

            <section className="rounded-xl p-8 bg-surface-bright shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
              <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderBottom: '1px solid #c7c4d7' }}>
                <span className="material-symbols-outlined text-primary" data-icon="account_tree">account_tree</span>
                <h2 className="text-headline-md font-headline-md text-on-surface">Related Waypoints</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-surface rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer border border-transparent hover:border-primary/30 transition-all duration-200 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:text-primary shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]" onClick={() => navigate('/dashboard')}>
                  <span className="material-symbols-outlined text-sm text-outline" data-icon="deployed_code">deployed_code</span>
                  <span className="text-data-lg font-data-lg">Docker</span>
                  <span className="bg-surface-container text-data-sm font-data-sm px-2 py-0.5 rounded ml-2">Prereq</span>
                </div>
                <div className="bg-surface rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer border border-transparent hover:border-primary/30 transition-all duration-200 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:text-primary shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]" onClick={() => navigate('/dashboard')}>
                  <span className="material-symbols-outlined text-sm text-outline" data-icon="cloud">cloud</span>
                  <span className="text-data-lg font-data-lg">AWS EKS</span>
                  <span className="bg-primary-container text-on-primary-container text-data-sm font-data-sm px-2 py-0.5 rounded ml-2">+12%</span>
                </div>
                <div className="bg-surface rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer border border-transparent hover:border-primary/30 transition-all duration-200 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:text-primary shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]" onClick={() => navigate('/dashboard')}>
                  <span className="material-symbols-outlined text-sm text-outline" data-icon="mediation">mediation</span>
                  <span className="text-data-lg font-data-lg">Helm</span>
                  <span className="bg-surface-container text-data-sm font-data-sm px-2 py-0.5 rounded ml-2">Next</span>
                </div>
                <div className="bg-surface rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer border border-transparent hover:border-primary/30 transition-all duration-200 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:text-primary shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]" onClick={() => navigate('/dashboard')}>
                  <span className="material-symbols-outlined text-sm text-outline" data-icon="memory">memory</span>
                  <span className="text-data-lg font-data-lg">Kubeflow</span>
                  <span className="bg-waypoint text-white text-data-sm font-data-sm px-2 py-0.5 rounded ml-2">Synergy</span>
                </div>
              </div>
            </section>
          </div>

          <div className="md:col-span-4 flex flex-col gap-gutter">
            <section className="rounded-xl p-6 bg-surface-bright h-full shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
              <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderBottom: '1px solid #c7c4d7' }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary" data-icon="domain">domain</span>
                  <h2 className="text-data-lg font-data-lg text-on-surface font-bold">Top Employers</h2>
                </div>
                <span className="text-data-sm font-data-sm text-primary cursor-pointer hover:underline">View All</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-bright transition-colors cursor-pointer border border-transparent hover:border-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center font-data-lg text-primary font-bold shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">OAI</div>
                    <div>
                      <div className="text-body-sm font-body-sm font-bold text-on-surface">OpenAI</div>
                      <div className="text-data-sm font-data-sm text-on-surface-variant">42 Open Roles</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline" data-icon="chevron_right">chevron_right</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-bright transition-colors cursor-pointer border border-transparent hover:border-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center font-data-lg text-danger font-bold shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">AN</div>
                    <div>
                      <div className="text-body-sm font-body-sm font-bold text-on-surface">Anthropic</div>
                      <div className="text-data-sm font-data-sm text-on-surface-variant">28 Open Roles</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline" data-icon="chevron_right">chevron_right</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-bright transition-colors cursor-pointer border border-transparent hover:border-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center font-data-lg text-tertiary font-bold shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">SCL</div>
                    <div>
                      <div className="text-body-sm font-body-sm font-bold text-on-surface">Scale AI</div>
                      <div className="text-data-sm font-data-sm text-on-surface-variant">15 Open Roles</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline" data-icon="chevron_right">chevron_right</span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 rounded-lg border-2 text-data-lg font-data-lg text-on-surface-variant hover:bg-surface transition-colors hover:text-primary flex items-center justify-center gap-2" style={{ border: '1px solid #c7c4d7' }}>
                <span className="material-symbols-outlined" data-icon="search">search</span>
                Search Job Market
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillDetail;
