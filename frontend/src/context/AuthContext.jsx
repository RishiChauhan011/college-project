import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchApi } from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Optional: if there's a profile endpoint

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchApi('/profile')
        .then(data => {
          if (data && data.email) {
            setUser(data);
          } else {
            logout();
          }
        })
        .catch(() => logout());
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    // Backend expects OAuth2PasswordRequestForm data which requires URL encoded form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const data = await fetchApi('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    setToken(data.access_token);
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
    setToken(null);
    setUser(null);
  };

  const adminLogin = async (adminId, pin) => {
    const data = await fetchApi('/admin-login', {
      method: 'POST',
      body: JSON.stringify({ admin_id: adminId, pin: pin }),
    });
    setToken(data.access_token);
    return data;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, signup, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
