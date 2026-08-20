import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';
import { fetchApi } from '../api/apiClient';
import { useDomain } from '../context/DomainContext';
import { useAuth } from '../context/AuthContext';

const Roadmap = () => {
  const navigate = useNavigate();
  const { domain } = useDomain();
  const { user } = useAuth();
  
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const targetDomain = domain || user?.profile?.preferred_field;

  const generateRoadmap = async () => {
    setIsLoading(true);
    setError('');
    try {
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

      if (!userSkills || userSkills.length === 0) {
        setRoadmap(null);
        setIsLoading(false);
        return;
      }

      if (!userSkills || userSkills.length === 0) {
        setError('No skills found in your profile. Please upload a resume or complete your profile to generate a roadmap.');
        setRoadmap(null);
        setIsLoading(false);
        return;
      }

      if (!targetDomain) {
        setError('No career domain specified. Please select a preferred field in your profile.');
        setRoadmap(null);
        setIsLoading(false);
        return;
      }

      const uniqueSkills = [...new Set(userSkills.map((s) => s.toLowerCase()))];

      const response = await fetchApi('/recommendation', {
        method: 'POST',
        body: JSON.stringify({
          target_domain: targetDomain,
          resume_skills: uniqueSkills,
        }),
      });
      setRoadmap(response);
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateRoadmap();
  }, [domain, user?.profile?.skills, user?.profile?.preferred_field]);

  const contourLineStyle = {
    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, #c7c4d7 10px, #c7c4d7 20px)`,
    backgroundSize: '20px 2px',
    backgroundRepeat: 'repeat-x'
  };
  
  const contourLineActiveStyle = {
    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, #4648d4 10px, #4648d4 20px)`,
    backgroundSize: '20px 2px',
    backgroundRepeat: 'repeat-x'
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <SideNavBar />

      <main className="flex-1 lg:ml-64 pt-24 px-margin-mobile md:px-margin-desktop pb-24 max-w-container-max mx-auto w-full relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">Career Trajectory</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Navigating towards your target in {targetDomain || 'your chosen domain'}
            </p>
          </div>
          <button 
            onClick={generateRoadmap}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-surface-bright border border-outline-variant rounded-full font-data-sm text-data-sm text-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">{isLoading ? 'hourglass_empty' : 'refresh'}</span>
            {isLoading ? 'Generating...' : 'Regenerate Roadmap'}
          </button>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-error/20 elevation-1">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-error">warning</span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold">Domain Unrecognized</h3>
                <p className="font-body-md text-body-md mt-1">
                  We couldn't generate a roadmap for this domain. Please check your profile's preferred field.
                </p>
              </div>
            </div>
            <Link
              to="/profile/edit"
              className="bg-error text-on-error px-5 py-2.5 rounded-lg font-data-sm text-data-sm hover:brightness-110 transition-all flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile Domain
            </Link>
          </div>
        )}

        <div className="bg-surface rounded-2xl p-8 relative shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] mb-12 overflow-x-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-bright to-surface opacity-50"></div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-secondary">
               <span className="material-symbols-outlined animate-spin text-4xl mr-4">sync</span>
               Analyzing market topology and skill gaps...
            </div>
          ) : roadmap ? (
            <div className="relative z-10 hidden md:flex items-center justify-between h-64 mt-12 mb-8 min-w-max px-8">
              <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] z-0" style={contourLineStyle}></div>
              <div className="absolute left-10 w-[20%] top-1/2 -translate-y-1/2 h-[2px] z-0" style={contourLineActiveStyle}></div>
              
              <div className="relative flex flex-col items-center group z-10 w-48">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] border-4 border-surface-bright relative">
                  <span className="material-symbols-outlined">flag</span>
                  <div className="absolute inset-[-8px] rounded-full border border-primary opacity-30 animate-pulse"></div>
                </div>
                <div className="mt-4 text-center">
                  <div className="font-data-sm text-data-sm text-primary mb-1">Basecamp</div>
                  <div className="font-headline-md text-headline-md text-on-surface text-lg">Current Profile</div>
                  <div className="font-body-sm text-body-sm text-success mt-1 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Match: {Math.round(roadmap.match_score)}%
                  </div>
                </div>
                <div className="absolute bottom-full mb-4 w-48 p-4 bg-surface-bright rounded-xl shadow-[4px_4px_10px_rgba(163,177,198,0.5)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Recognized Skills: {roadmap.recognized_skills?.slice(0,3).join(', ')}{roadmap.recognized_skills?.length > 3 ? '...' : ''}
                  </p>
                </div>
              </div>

              {roadmap.missing_skills?.slice(0, 3).map((skill, index) => (
                <div key={index} className="relative flex flex-col items-center group z-10 cursor-pointer w-48" onClick={() => navigate('/skill-insight')}>
                  <div className="w-10 h-10 rounded-full bg-surface-bright text-primary flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] border-2 border-primary">
                    <span className="material-symbols-outlined text-[20px]">architecture</span>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="font-data-sm text-data-sm text-outline mb-1">Milestone {index + 1}</div>
                    <div className="font-headline-md text-headline-md text-on-surface text-lg">{skill.skill}</div>
                    <div className="font-data-sm text-data-sm text-success mt-1">ROI Score: {Math.round(skill.roi_score)}</div>
                  </div>
                  <div className="absolute bottom-full mb-4 w-48 p-4 bg-surface-bright rounded-xl shadow-[4px_4px_10px_rgba(163,177,198,0.5)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Est. time: {skill.estimated_learning_weeks} weeks.</p>
                  </div>
                </div>
              ))}

              <div className="relative flex flex-col items-center group z-10 w-48">
                <div className="w-14 h-14 rounded-xl bg-surface-bright text-tertiary flex items-center justify-center shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] border-2 border-surface-bright rotate-45">
                  <span className="material-symbols-outlined -rotate-45 text-[24px]">workspace_premium</span>
                </div>
                <div className="mt-6 text-center">
                  <div className="font-data-sm text-data-sm text-tertiary mb-1">Destination</div>
                  <div className="font-headline-md text-headline-md text-on-surface text-xl">Domain Expert</div>
                  <div className="font-data-sm text-data-sm text-on-surface-variant mt-1">{roadmap.estimated_learning_weeks} Weeks Total</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-secondary">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">route</span>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-2">No Career Roadmap Generated Yet</h3>
              <p className="text-body-sm max-w-md mx-auto mb-6 text-on-surface-variant">
                Complete your profile or upload your resume to generate an AI-guided skill milestone trajectory.
              </p>
              <Link to="/profile/edit" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-data-sm text-data-sm hover:bg-surface-tint transition-all inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">edit</span> Complete Profile
              </Link>
            </div>
          )}
          
          {roadmap && roadmap.roadmap_narrative && (
             <div className="mt-8 p-6 bg-surface-bright rounded-xl elevation-2 border-l-4 border-primary">
               <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2 text-on-surface">
                 <span className="material-symbols-outlined text-primary">psychology</span> AI Strategy Narrative
               </h3>
               {(() => {
                 const text = roadmap.roadmap_narrative;
                 const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
                 return (
                   <div className="space-y-4">
                     {paragraphs.map((para, pIdx) => {
                       const parts = para.split(/(\*\*.*?\*\*|<b>.*?<\/b>)/g);
                       return (
                         <p key={pIdx} className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                           {parts.map((part, partIdx) => {
                             if (part.startsWith('**') && part.endsWith('**')) {
                               return (
                                 <strong key={partIdx} className="font-bold text-on-surface">
                                   {part.slice(2, -2)}
                                 </strong>
                               );
                             } else if (part.startsWith('<b>') && part.endsWith('</b>')) {
                               return (
                                 <strong key={partIdx} className="font-bold text-on-surface">
                                   {part.slice(3, -4)}
                                 </strong>
                               );
                             }
                             return part;
                           })}
                         </p>
                       );
                     })}
                   </div>
                 );
               })()}
             </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-[0_4px_14px_rgba(70,72,212,0.4)] flex items-center justify-center hover:bg-surface-tint transition-colors hover:scale-110">
          <span className="material-symbols-outlined text-2xl">chat</span>
        </button>
      </div>
    </div>
  );
};

export default Roadmap;
