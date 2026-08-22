import React from 'react';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';

const About = () => {
  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar showNavLinks={false} />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-8">
        {/* Header Hero */}
        <div className="border-b border-outline-variant/20 pb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-body-sm px-3.5 py-1 rounded-full font-bold mb-3 border border-primary/20">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            PathFinder AI Career Intelligence
          </div>
          <h1 className="text-headline-xl font-headline-xl text-on-surface font-extrabold mb-2">
            About the Platform
          </h1>
          <p className="text-body-lg font-body-lg text-secondary max-w-3xl leading-relaxed">
            PathFinder AI bridges student preparation and live market demand by analyzing job postings to predict best-fit career roles and generate personalized roadmaps.
          </p>
        </div>

        {/* Section 1: Data-Driven Market Foundation */}
        <section className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">database</span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                Data-Driven Market Foundation
              </h2>
              <p className="text-body-sm text-secondary">
                Empirical job market index — not estimates or manual trend lists
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-body-md mb-2">
                  <span className="material-symbols-outlined">dataset</span>
                  Continuous Market Ingestion
                </div>
                <p className="text-body-sm text-secondary leading-relaxed">
                  Ingests real job postings across 6 core domains: AI &amp; Data Science, Software, Analytics, Design, Marketing, and Education.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-body-md mb-2">
                  <span className="material-symbols-outlined">trending_up</span>
                  Empirical Demand Indexing
                </div>
                <p className="text-body-sm text-secondary leading-relaxed">
                  Every skill frequency and company ranking is calculated directly from active job market data to reflect true hiring demand.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: What PathFinder AI Delivers */}
        <section className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-waypoint/10 text-waypoint flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                What PathFinder AI Delivers
              </h2>
              <p className="text-body-sm text-secondary">
                End-to-end guidance from resume parsing to target role readiness
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-body-md mb-2">
                  <span className="material-symbols-outlined">smart_toy</span>
                  AI Predicted Best-Fit Role
                </div>
                <p className="text-body-sm text-secondary leading-relaxed">
                  Matches your profile skills against ML classifiers to identify your top career match and match confidence score.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-body-md mb-2">
                  <span className="material-symbols-outlined">insights</span>
                  Skill-Gap &amp; ROI Prioritization
                </div>
                <p className="text-body-sm text-secondary leading-relaxed">
                  Highlights high-value missing skills compared against market demand to maximize your learning time ROI.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-body-md mb-2">
                  <span className="material-symbols-outlined">alt_route</span>
                  Personalized Milestone Roadmap
                </div>
                <p className="text-body-sm text-secondary leading-relaxed">
                  Structures learning into Foundational, Core, and Advanced waypoints paired with Google Gemini AI strategic advice.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-body-md mb-2">
                  <span className="material-symbols-outlined">corporate_fare</span>
                  Hiring Partner Directory
                </div>
                <p className="text-body-sm text-secondary leading-relaxed">
                  Indexes employers recruiting talent in your target domain with open position counts and company profiles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Transparency Principles */}
        <section className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                Our Transparency Principles
              </h2>
              <p className="text-body-sm text-secondary">
                Guaranteed accuracy and empirical reporting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-surface-bright border-l-4 border-primary">
              <h3 className="font-bold text-on-surface text-body-md mb-1.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                Disclosed Salary Data Only
              </h3>
              <p className="text-body-sm text-secondary leading-relaxed">
                Reports compensation based strictly on job postings that explicitly disclose salary. We never estimate missing salary figures.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-surface-bright border-l-4 border-waypoint">
              <h3 className="font-bold text-on-surface text-body-md mb-1.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-waypoint text-[18px]">fact_check</span>
                Objective Skill Matching
              </h3>
              <p className="text-body-sm text-secondary leading-relaxed">
                Skill match percentages and milestone recommendations use standardized taxonomies extracted directly from live job descriptions.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
