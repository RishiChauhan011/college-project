import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { fetchApi } from '../api/apiClient';
import { isProfileComplete } from '../utils/profile';

const SignupLogin = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, adminLogin } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      // Determine destination based on live profile completeness
      const prof = await fetchApi('/profile');
      if (prof?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (isProfileComplete(prof)) {
        let dest = (from && from !== '/login' && from !== '/onboarding') ? from : '/dashboard';
        // Prevent regular users from being redirected to admin routes
        if (dest.startsWith('/admin')) {
          dest = '/dashboard';
        }
        navigate(dest, { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup(name, email, password);
      // Automatically log the new user in to establish authenticated session
      await login(email, password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await adminLogin(adminId, adminPin);
      const destination = location.state?.from?.pathname || '/admin';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate admin');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setAdminId('');
    setAdminPin('');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center font-body-md relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at center, #e0e3e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path className="opacity-50" d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="#767586" strokeWidth="0.2"></path>
          <path className="opacity-30" d="M0,70 Q35,50 60,70 T100,60" fill="none" stroke="#767586" strokeWidth="0.2"></path>
          <path className="opacity-40" d="M0,30 Q45,10 70,30 T100,20" fill="none" stroke="#767586" strokeWidth="0.2"></path>
        </svg>
      </div>

      <main className="w-full max-w-md mx-margin-mobile z-10 relative">
        <div className="bg-surface rounded-xl elevation-1 p-8 shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)]">
          <div className="text-center mb-8">
            <Link to="/" className="font-headline-lg text-headline-lg text-waypoint mb-2 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span> PathFinder AI
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Navigate your career trajectory.</p>
          </div>

          <div className="flex mb-8 bg-surface-container-low rounded-lg p-1 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]" role="tablist">
            <button 
              aria-selected={activeTab === 'login'} 
              className={`flex-1 py-2 text-center rounded-md font-data-sm text-data-sm transition-all duration-200 ${activeTab === 'login' ? 'bg-surface shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              onClick={() => switchTab('login')} 
              role="tab"
            >
              Log In
            </button>
            <button 
              aria-selected={activeTab === 'signup'} 
              className={`flex-1 py-2 text-center rounded-md font-data-sm text-data-sm transition-all duration-200 ${activeTab === 'signup' ? 'bg-surface shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              onClick={() => switchTab('signup')} 
              role="tab"
            >
              Sign Up
            </button>
            <button 
              aria-selected={activeTab === 'admin'} 
              className={`flex-1 py-2 text-center rounded-md font-data-sm text-data-sm transition-all duration-200 ${activeTab === 'admin' ? 'bg-surface shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              onClick={() => switchTab('admin')} 
              role="tab"
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-error-container text-on-error-container rounded-lg text-body-sm text-center">
              {error}
            </div>
          )}

          {activeTab === 'login' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block font-data-sm text-data-sm text-secondary mb-2 uppercase tracking-widest" htmlFor="login-email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:ring-2 focus:ring-waypoint focus:outline-none transition-shadow" id="login-email" placeholder="architect@example.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block font-data-sm text-data-sm text-secondary mb-2 uppercase tracking-widest" htmlFor="login-password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-10 pr-10 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:ring-2 focus:ring-waypoint focus:outline-none transition-shadow" id="login-password" placeholder="••••••••" required type={showLoginPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors focus:outline-none" onClick={() => setShowLoginPassword(!showLoginPassword)} type="button">
                    <span className="material-symbols-outlined">{showLoginPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-primary-container text-on-primary-container font-data-lg text-data-lg py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary transition-colors elevation-1 active:scale-[0.98] disabled:opacity-50">
                <span>{isLoading ? 'Processing...' : 'Log In'}</span><span className="material-symbols-outlined">arrow_forward</span>
              </button>

            </form>
          )}

          {activeTab === 'signup' && (
            <form className="space-y-6" onSubmit={handleSignup}>
              <div>
                <label className="block font-data-sm text-data-sm text-secondary mb-2 uppercase tracking-widest" htmlFor="signup-name">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:ring-2 focus:ring-waypoint focus:outline-none transition-shadow" id="signup-name" placeholder="Alex Chen" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block font-data-sm text-data-sm text-secondary mb-2 uppercase tracking-widest" htmlFor="signup-email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:ring-2 focus:ring-waypoint focus:outline-none transition-shadow" id="signup-email" placeholder="architect@example.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block font-data-sm text-data-sm text-secondary mb-2 uppercase tracking-widest" htmlFor="signup-password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-10 pr-10 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:ring-2 focus:ring-waypoint focus:outline-none transition-shadow" id="signup-password" placeholder="••••••••" type={showSignupPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors focus:outline-none" onClick={() => setShowSignupPassword(!showSignupPassword)} type="button">
                    <span className="material-symbols-outlined">{showSignupPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <p className="font-data-sm text-data-sm text-outline-variant mt-2 text-xs">Must be at least 8 characters with a mix of letters and numbers.</p>
              </div>

              <button disabled={isLoading} className="w-full bg-primary-container text-on-primary-container font-data-lg text-data-lg py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary transition-colors elevation-1 active:scale-[0.98] disabled:opacity-50" type="submit">
                <span>{isLoading ? 'Creating...' : 'Create Account'}</span>
              </button>
              

            </form>
          )}

          {activeTab === 'admin' && (
            <form className="space-y-6" onSubmit={handleAdminLogin}>
              <div>
                <label className="block font-data-sm text-data-sm text-secondary mb-2 uppercase tracking-widest" htmlFor="admin-id">Admin ID</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">admin_panel_settings</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-10 pr-4 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:ring-2 focus:ring-waypoint focus:outline-none transition-shadow" id="admin-id" placeholder="admin" required type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block font-data-sm text-data-sm text-secondary uppercase tracking-widest mb-2" htmlFor="admin-pin">Admin PIN</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">dialpad</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-10 pr-10 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] focus:ring-2 focus:ring-waypoint focus:outline-none transition-shadow" id="admin-pin" placeholder="••••" required type={showAdminPin ? 'text' : 'password'} value={adminPin} onChange={(e) => setAdminPin(e.target.value)} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors focus:outline-none" onClick={() => setShowAdminPin(!showAdminPin)} type="button">
                    <span className="material-symbols-outlined">{showAdminPin ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <button disabled={isLoading} type="submit" className="w-full bg-primary-container text-on-primary-container font-data-lg text-data-lg py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary transition-colors elevation-1 active:scale-[0.98] disabled:opacity-50 mt-4">
                <span>{isLoading ? 'Authenticating...' : 'Secure Access'}</span><span className="material-symbols-outlined">lock_open</span>
              </button>
            </form>
          )}
        </div>
        <div className="text-center mt-6">
          <p className="font-body-sm text-body-sm text-secondary">
            By authenticating, you agree to the <Link className="text-waypoint hover:underline" to="#">Terms of Service</Link> &amp; <Link className="text-waypoint hover:underline" to="#">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignupLogin;
