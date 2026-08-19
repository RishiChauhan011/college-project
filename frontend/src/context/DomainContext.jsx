import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const DomainContext = createContext();

export const useDomain = () => useContext(DomainContext);

export const DomainProvider = ({ children }) => {
  const { user } = useAuth();
  const [domain, setDomain] = useState(user?.profile?.preferred_field || '');

  useEffect(() => {
    if (user?.profile?.preferred_field) {
      setDomain(user.profile.preferred_field);
    } else if (!user) {
      setDomain('');
    }
  }, [user?.profile?.preferred_field]);

  return (
    <DomainContext.Provider value={{ domain, setDomain }}>
      {children}
    </DomainContext.Provider>
  );
};

