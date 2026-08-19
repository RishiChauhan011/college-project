import React, { createContext, useState, useContext } from 'react';

const DomainContext = createContext();

export const useDomain = () => useContext(DomainContext);

export const DomainProvider = ({ children }) => {
  const [domain, setDomain] = useState('AI & Data Science');

  return (
    <DomainContext.Provider value={{ domain, setDomain }}>
      {children}
    </DomainContext.Provider>
  );
};
