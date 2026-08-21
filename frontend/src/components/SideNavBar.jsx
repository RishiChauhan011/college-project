import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SideNavBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getRoleText = () => {
    if (!user) return 'Guest User';
    if (user.role === 'admin') return 'Administrator';
    if (user.profile?.preferred_field) return user.profile.preferred_field;
    if (user.profile?.skills?.length > 0) return user.profile.skills[0];
    return 'User';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 pt-24 pb-8 px-4 docked w-64 bg-surface dark:bg-inverse-surface shadow-[4px_0px_10px_rgba(163,177,198,0.3)] shadow-lg z-40">
      <div className="mb-8 px-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-body-md elevation-1 border border-primary/20 shrink-0">
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-body-md font-headline-md font-semibold text-on-surface">{user ? user.name : 'Guest User'}</h3>
          <p className="text-data-sm font-data-sm text-on-surface-variant capitalize">{getRoleText()}</p>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${currentPath === '/dashboard' ? 'bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] translate-x-1 transition-transform' : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-secondary-fixed-dim'}`}
        >
          <span className="material-symbols-outlined" data-icon="explore" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          <span className="text-body-sm font-body-sm font-medium">Home</span>
        </Link>
        <Link 
          to="/skill-insight" 
          className={`flex items-center gap-3 px-4 py-3 transition-all ${currentPath === '/skill-insight' ? 'bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] translate-x-1 transition-transform' : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-secondary-fixed-dim'}`}
        >
          <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
          <span className="text-body-sm font-body-sm">Analysis</span>
        </Link>
        <Link 
          to="/roadmap" 
          className={`flex items-center gap-3 px-4 py-3 transition-all ${currentPath === '/roadmap' ? 'bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] translate-x-1 transition-transform' : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-secondary-fixed-dim'}`}
        >
          <span className="material-symbols-outlined" data-icon="insights">insights</span>
          <span className="text-body-sm font-body-sm">Roadmap</span>
        </Link>
        <Link 
          to="/about" 
          className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl ${currentPath === '/about' ? 'bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] translate-x-1 transition-transform' : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-secondary-fixed-dim'}`}
        >
          <span className="material-symbols-outlined" data-icon="info">info</span>
          <span className="text-body-sm font-body-sm">About</span>
        </Link>
      </nav>
      {user && (
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline-variant/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all px-4 py-3 rounded-xl w-full text-left font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-body-sm font-body-sm">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default SideNavBar;
