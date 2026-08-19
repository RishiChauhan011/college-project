import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close popup on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Close popup on route change
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate('/');
  };

  const navLinkClass = (path) =>
    `pb-1 text-headline-md font-headline-md transition-colors duration-200 ${
      currentPath === path
        ? 'text-primary dark:text-primary-fixed border-b-2 border-primary font-bold scale-95 transition-transform'
        : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed'
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 bg-surface-bright dark:bg-surface-dim shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] shadow-md hidden md:flex">
      {/* Left: Brand + Links */}
      <div className="flex items-center gap-8">
        <Link className="text-headline-md font-headline-md font-bold text-waypoint dark:text-tertiary-fixed-dim tracking-tight" to="/">
          PathFinder AI
        </Link>
        <div className="flex items-center gap-6">
          <Link className={navLinkClass('/dashboard')} to="/dashboard">Dashboard</Link>
          <Link className={navLinkClass('/roadmap')} to="/roadmap">Roadmap</Link>
          <Link className={navLinkClass('/about')} to="/about">About</Link>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Logout button — replaces Career Selector for authenticated users */}
            <button
              onClick={handleLogout}
              className="bg-surface text-on-surface-variant border border-outline-variant/40 px-4 py-2 rounded-lg font-data-sm text-data-sm hover:bg-error-container hover:text-on-error-container hover:border-error/30 transition-all flex items-center gap-2 shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Logout
            </button>

            {/* Profile icon with popup */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((v) => !v)}
                aria-label="Open profile menu"
                aria-haspopup="true"
                aria-expanded={profileMenuOpen}
                className={`text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${profileMenuOpen ? 'text-primary bg-surface-container-low' : ''}`}
              >
                <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] w-56 bg-surface rounded-xl shadow-[6px_6px_12px_rgba(163,177,198,0.3),-6px_-6px_12px_rgba(255,255,255,1)] border border-outline-variant/30 overflow-hidden z-50 animate-[fadeIn_0.15s_ease]"
                  role="menu"
                >
                  {/* User identity area */}
                  {user?.name && (
                    <div className="px-4 py-3 border-b border-outline-variant/30 bg-surface-container-low">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-white font-bold text-xs flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-data-md text-data-md text-on-surface truncate">{user.name}</div>
                          {user.email && (
                            <div className="font-data-sm text-[10px] text-on-surface-variant truncate">{user.email}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profile link */}
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                    Profile
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Unauthenticated: login icon only */}
            <button
              onClick={() => navigate('/login')}
              aria-label="Sign in"
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full elevation-1"
            >
              <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
