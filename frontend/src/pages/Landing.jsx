import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="font-body-md antialiased topo-line min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 md:pt-32 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full relative z-10">
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center relative">
          <div className="absolute inset-0 topo-bg -z-10 opacity-50 pointer-events-none rounded-3xl mix-blend-multiply"></div>
          <div className="flex flex-col gap-6 pr-0 lg:pr-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full elevation-1 w-max">
              <span className="material-symbols-outlined text-waypoint text-[18px]">satellite_alt</span>
              <span className="text-data-sm font-data-sm text-secondary uppercase tracking-wider">Intelligence Engine v2.0</span>
            </div>
            <h1 className="text-headline-xl font-headline-xl text-on-surface leading-tight">
              Navigate Your Career with <span className="text-primary block">Precision Intelligence</span>
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
              Stop guessing your next move. Our AI maps your current skills against real-time market topography to plot the optimal route to your target role.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Link to="/login" className="bg-primary text-on-primary px-8 py-4 rounded-lg text-data-lg font-data-lg hover:bg-surface-tint hover:scale-95 transition-all duration-200 shadow-lg inline-block text-center">
                Get Started
              </Link>
            </div>
          </div>

          <div className="relative h-[500px] elevation-1 rounded-2xl p-8 flex flex-col justify-between overflow-hidden bg-surface">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e3e5_1px,transparent_1px),linear-gradient(to_bottom,#e0e3e5_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <path className="opacity-50" d="M 100,120 C 200,120 150,250 250,250 S 350,380 450,380" fill="none" stroke="#767586" strokeDasharray="4 4" strokeWidth="2"></path>
            </svg>

            <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 rounded-full bg-outline"></div>
                    <span className="text-data-sm font-data-sm text-secondary uppercase">Current Coordinates</span>
                </div>
                <div className="elevation-2-inset px-4 py-3 rounded-lg bg-surface w-max">
                    <span className="text-body-md font-body-md font-medium">Current Role</span>
                </div>
            </div>

            <div className="absolute top-[220px] left-[180px] z-10 -translate-x-1/2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center waypoint-glow">
                    <div className="w-2 h-2 rounded-full bg-on-primary"></div>
                </div>
                <div className="mt-2 elevation-1 px-3 py-1.5 rounded-md bg-surface text-center w-max">
                    <span className="text-data-sm font-data-sm text-on-surface">Foundational Skill</span>
                </div>
            </div>

            <div className="absolute top-[280px] right-[180px] z-10 translate-x-1/2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center waypoint-glow">
                    <div className="w-2 h-2 rounded-full bg-on-primary"></div>
                </div>
                <div className="mt-2 elevation-1 px-3 py-1.5 rounded-md bg-surface text-center w-max">
                    <span className="text-data-sm font-data-sm text-on-surface">Core Competency</span>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 z-10">
                <div className="flex items-center gap-3 mb-2 justify-end">
                    <span className="text-data-sm font-data-sm text-waypoint uppercase font-bold">Target Destination</span>
                    <div className="w-5 h-5 rounded-full bg-waypoint flex items-center justify-center waypoint-glow">
                        <span className="material-symbols-outlined text-on-primary text-[14px]">flag</span>
                    </div>
                </div>
                <div className="elevation-1 px-5 py-4 rounded-xl border border-primary-fixed bg-surface-bright">
                    <span className="text-headline-md font-headline-md text-primary font-bold">Target Role</span>
                    <div className="mt-2 flex gap-2">
                        <span className="skill-chip elevation-1 px-2 py-1 rounded text-data-sm font-data-sm text-on-surface-variant">Primary Path</span>
                        <span className="skill-chip elevation-1 px-2 py-1 rounded text-data-sm font-data-sm text-on-surface-variant">Growth Area</span>
                    </div>
                </div>
            </div>
          </div>
        </section>

        <section className="mb-32" id="features">
          <div className="text-center mb-16">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-4">Precision Analysis Workflow</h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">How our intelligence engine processes your profile to build actionable career cartography.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            
            <div className="elevation-1 rounded-2xl p-8 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[120px]">document_scanner</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center mb-6 elevation-2-inset">
                <span className="material-symbols-outlined text-primary text-[24px]">description</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-3">We read your resume</h3>
              <p className="text-body-md font-body-md text-on-surface-variant flex-grow">
                Deep parsing algorithms extract not just titles, but underlying competencies, contextualizing your experience within our global skills taxonomy.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="skill-chip elevation-1 px-3 py-1 rounded-md text-data-sm font-data-sm text-secondary">Parsing</span>
                <span className="skill-chip elevation-1 px-3 py-1 rounded-md text-data-sm font-data-sm text-secondary">NLP</span>
              </div>
            </div>

            <div className="elevation-1 rounded-2xl p-8 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border-t-4 border-waypoint">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[120px]">troubleshoot</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">compare_arrows</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-3">We compare it to real job demand</h3>
              <p className="text-body-md font-body-md text-on-surface-variant flex-grow">
                Your profile is overlaid onto real-time market data, highlighting elevation gaps between your current skill set and active industry requirements.
              </p>
              <div className="mt-6 h-16 elevation-2-inset rounded-lg p-2 flex items-end gap-1 overflow-hidden">
                <div className="w-1/4 bg-surface-variant rounded-t-sm h-1/3"></div>
                <div className="w-1/4 bg-primary-fixed rounded-t-sm h-2/3"></div>
                <div className="w-1/4 bg-primary rounded-t-sm h-full"></div>
                <div className="w-1/4 bg-waypoint rounded-t-sm h-4/5"></div>
              </div>
            </div>

            <div className="elevation-1 rounded-2xl p-8 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[120px]">map</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center mb-6 elevation-2-inset">
                <span className="material-symbols-outlined text-primary text-[24px]">route</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-3">You get a roadmap, not a guess</h3>
              <p className="text-body-md font-body-md text-on-surface-variant flex-grow">
                Receive a step-by-step topographical guide outlining specific courses, projects, and intermediate roles required to reach your target summit.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-outline"></div>
                <div className="h-px bg-outline flex-grow"></div>
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="h-px bg-outline flex-grow"></div>
                <div className="w-3 h-3 rounded-full bg-waypoint waypoint-glow"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-bright mt-auto py-8 border-t border-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-70">
            <span className="material-symbols-outlined text-[20px]">explore</span>
            <span className="text-data-lg font-data-lg font-bold">PathFinder AI</span>
          </div>
          <div className="flex gap-8">
            <Link className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" to="#features">About</Link>
            <Link className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" to="#">Contact</Link>
            <Link className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors" to="#features">Methodology</Link>
          </div>
          <div className="text-data-sm font-data-sm text-outline">
            © 2024 AI Career Intelligence
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
