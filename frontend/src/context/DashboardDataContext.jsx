import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useDomain } from './DomainContext';
import { fetchApi } from '../api/apiClient';

const DashboardDataContext = createContext();

export const useDashboardData = () => useContext(DashboardDataContext);

export const DashboardDataProvider = ({ children }) => {
  const { user } = useAuth();
  const { domain, setDomain } = useDomain();

  const [availableDomains, setAvailableDomains] = useState([]);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [domainAnalytics, setDomainAnalytics] = useState(null);
  const [roleFit, setRoleFit] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRoleFit, setLoadingRoleFit] = useState(false);

  const prevDomainRef = useRef(null);
  const prevSkillsKeyRef = useRef(null);

  // 1. Initial analytics summary load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const summary = await fetchApi('/analytics');
        setAnalyticsSummary(summary);
        setAvailableDomains(summary.available_domains || []);

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

  // 2. Fetch domain analytics & jobs (only refetch when domain changes)
  useEffect(() => {
    if (!domain) return;
    if (prevDomainRef.current === domain && domainAnalytics) {
      return;
    }

    prevDomainRef.current = domain;
    const fetchDomainData = async () => {
      setLoadingStats(true);
      setLoadingJobs(true);
      try {
        const [domainData, jobsData] = await Promise.all([
          fetchApi(`/analytics/domain/${encodeURIComponent(domain)}`),
          fetchApi(`/jobs?domain=${encodeURIComponent(domain)}`),
        ]);
        setDomainAnalytics(domainData);
        setJobs(jobsData || []);
      } catch (error) {
        console.error(`Failed to load analytics/jobs for ${domain}:`, error);
      } finally {
        setLoadingStats(false);
        setLoadingJobs(false);
      }
    };

    fetchDomainData();
  }, [domain]);

  // 3. Fetch Role Fit & Roadmap (only refetch when skills or domain actually change)
  useEffect(() => {
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

    const skillsKey = JSON.stringify({
      skills: (userSkills || []).slice().sort(),
      domain: domain || '',
    });

    if (prevSkillsKeyRef.current === skillsKey && roleFit) {
      return;
    }

    if (userSkills && userSkills.length > 0) {
      prevSkillsKeyRef.current = skillsKey;
      const fetchRoleFit = async () => {
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
      };

      fetchRoleFit();
    } else {
      setRoleFit(null);
      setRoadmap(null);
    }
  }, [user?.profile?.skills, domain]);

  const value = {
    availableDomains,
    analyticsSummary,
    domainAnalytics,
    roleFit,
    roadmap,
    jobs,
    loadingStats,
    loadingJobs,
    loadingRoleFit,
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
};
