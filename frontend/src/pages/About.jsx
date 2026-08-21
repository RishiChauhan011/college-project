import React from 'react';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';

const About = () => {
  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-10">
        {/* Header Hero */}
        <div className="border-b border-outline-variant/20 pb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-body-sm px-3.5 py-1 rounded-full font-bold mb-3 border border-primary/20">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            PathFinder AI Career Intelligence
          </div>
          <h1 className="text-headline-xl font-headline-xl text-on-surface font-extrabold mb-3">
            About the Platform
          </h1>
          <p className="text-body-lg font-body-lg text-secondary max-w-3xl leading-relaxed">
            PathFinder AI bridges the gap between student preparation and live market demand by analyzing thousands of real-world job postings to predict best-fit career roles and generate personalized skill roadmaps.
          </p>
        </div>

        {/* Section 1: Data-Driven Market Foundation */}
        <section className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">database</span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                Data-Driven Market Foundation
              </h2>
              <p className="text-body-sm text-secondary">
                Empirical job market index — not estimates or hand-typed trends
              </p>
            </div>
          </div>
          <div className="text-body-md text-on-surface-variant space-y-3 leading-relaxed">
            <p>
              Our intelligence engine continuously ingests real job postings across six core career domains: <strong>AI &amp; Data Science</strong>, <strong>Software Development</strong>, <strong>Business Analytics</strong>, <strong>Graphic Design</strong>, <strong>Digital Marketing</strong>, and <strong>Education</strong>.
            </p>
            <p>
              Every skill frequency, company ranking, and demand metric displayed on your dashboard is calculated directly from extracted job market data, giving you an accurate reflection of what top hiring managers are looking for right now.
            </p>
          </div>
        </section>

        {/* Section 2: Core Student Intelligence Capabilities */}
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
                End-to-end guidance from resume extraction to target role readiness
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
                  Evaluates your extracted profile skills against pre-trained machine learning classifiers (scikit-learn Logistic Regression) to identify your top match role and match confidence.
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
                  Compares your current skill set against market demand to highlight high-value missing skills, helping you focus learning time where it yields the highest market ROI.
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
                  Structures learning into clear Foundational, Core, and Advanced waypoints, complemented by custom strategic guidance powered by Google Gemini AI.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-body-md mb-2">
                  <span className="material-symbols-outlined">corporate_fare</span>
                  Top Hiring Partner Directory
                </div>
                <p className="text-body-sm text-secondary leading-relaxed">
                  Indexes leading employers actively recruiting talent in your target domain, complete with open role counts and direct employer profiles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Honest & Transparent Principles */}
        <section className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
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

          <div className="text-body-md text-on-surface-variant space-y-4 leading-relaxed">
            <div className="p-4 rounded-xl bg-surface-bright border-l-4 border-primary">
              <h3 className="font-bold text-on-surface text-body-md mb-1">
                Strict Disclosed Salary Data Only
              </h3>
              <p className="text-body-sm text-secondary">
                We believe in total transparency. PathFinder AI reports salary statistics based strictly on job postings that explicitly disclose salary compensation. We never invent, extrapolate, or estimate missing salary numbers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-bright border-l-4 border-waypoint">
              <h3 className="font-bold text-on-surface text-body-md mb-1">
                Objective Skill Matching
              </h3>
              <p className="text-body-sm text-secondary">
                Your skill match percentage and learning recommendations are calculated using standardized skill taxonomies derived directly from real job descriptions.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
