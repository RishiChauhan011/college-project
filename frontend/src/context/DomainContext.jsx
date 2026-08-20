import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { fetchApi } from '../api/apiClient';

const DomainContext = createContext();

export const useDomain = () => useContext(DomainContext);

const DEFAULT_VALID_DOMAINS = [
  'AI & Data Science',
  'Software Development',
  'Business Analytics',
  'Graphic Design',
  'Digital Marketing',
  'Education',
];

export const DomainProvider = ({ children }) => {
  const { user } = useAuth();
  const [domain, setDomain] = useState(user?.profile?.preferred_field || 'AI & Data Science');
  const [validDomains, setValidDomains] = useState(DEFAULT_VALID_DOMAINS);

  useEffect(() => {
    fetchApi('/domains')
      .then((domains) => {
        if (Array.isArray(domains) && domains.length > 0) {
          setValidDomains(domains);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const rawDomain = user?.profile?.preferred_field;
    if (rawDomain) {
      const isValid = validDomains.some(
        (d) => d.toLowerCase() === rawDomain.trim().toLowerCase()
      );
      if (isValid) {
        setDomain(rawDomain);
      } else {
        setDomain('AI & Data Science');
      }
    } else if (!user) {
      setDomain('');
    }
  }, [user?.profile?.preferred_field, validDomains]);

  return (
    <DomainContext.Provider value={{ domain, setDomain }}>
      {children}
    </DomainContext.Provider>
  );
};

