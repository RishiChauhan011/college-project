import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { fetchApi } from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  // Tracks whether the current token change came from a login/adminLogin call
  // (which already fetches profile) so we skip the duplicate fetch in useEffect.
  const skipEffectRef = useRef(false);

  useEffect(() => {
    // login() and adminLogin() set skipEffectRef=true before calling setToken,
    // so we skip this effect for those calls (they handle profile fetch themselves).
    if (skipEffectRef.current) {
      skipEffectRef.current = false;
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      // Restore session on page refresh
      fetchApi('/profile')
        .then(data => {
          if (data && data.email) {
            setUser(data);
          } else {
            logout();
          }
        })
        .catch((err) => {
          // Only clear token if it is genuinely invalid/expired (401).
          // Do NOT logout on network errors or other transient failures.
          const msg = (err.message || '').toLowerCase();
          if (msg.includes('could not validate') || msg.includes('unauthorized') || msg.includes('401')) {
            logout();
          }
        });
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const data = await fetchApi('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    // Clear any stale user state before setting new token
    setUser(null);
    localStorage.setItem('token', data.access_token);
    skipEffectRef.current = true;
    setToken(data.access_token);

    try {
      const prof = await fetchApi('/profile');
      if (prof) setUser(prof);
    } catch (err) {
      console.error('Profile fetch error after login:', err);
    }
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await fetchApi('/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('extractedResume');
    setToken(null);
    setUser(null);
  };

  const adminLogin = async (adminId, pin) => {
    const data = await fetchApi('/admin-login', {
      method: 'POST',
      body: JSON.stringify({ admin_id: adminId, pin: pin }),
    });

    // Clear any stale user state before setting new admin token
    setUser(null);
    localStorage.setItem('token', data.access_token);
    skipEffectRef.current = true;
    setToken(data.access_token);

    try {
      const prof = await fetchApi('/profile');
      if (prof) setUser(prof);
    } catch (err) {
      console.error('Profile fetch error after admin login:', err);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, signup, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
