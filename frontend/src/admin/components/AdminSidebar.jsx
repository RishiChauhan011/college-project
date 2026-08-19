import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: 'dashboard', exact: true },
    { label: 'Users', path: '/admin/users', icon: 'group' },
    { label: 'Jobs', path: '/admin/jobs', icon: 'work' },
    { label: 'Companies', path: '/admin/companies', icon: 'business' },
    { label: 'Skills', path: '/admin/skills', icon: 'psychology' },
    { label: 'Analytics', path: '/admin/analytics', icon: 'analytics' },
    { label: 'AI Insights', path: '/admin/ai-insights', icon: 'auto_awesome' },
    { label: 'Activity', path: '/admin/activity', icon: 'history' },
  ];

  const isItemActive = (item) => {
    if (item.exact) {
      return currentPath === '/admin' || currentPath === '/admin/dashboard';
    }
    return currentPath.startsWith(item.path);
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] flex flex-col py-6 z-50">
      {/* Brand Logo Area */}
      <div className="px-6 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
        </div>
        <div>
          <h1 className="font-headline-md text-[17px] font-bold text-primary leading-tight">PathFinder AI</h1>
          <p className="font-data-sm text-on-surface-variant uppercase tracking-widest text-[9px]">Admin Control Center</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1.5">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
                active
                  ? 'shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-primary font-bold bg-surface-container scale-[0.98]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-body-md text-body-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Settings & Logout */}
      <div className="px-4 mt-auto pt-4 border-t border-outline-variant/30 space-y-1">
        <Link
          to="/admin/settings"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
            currentPath.startsWith('/admin/settings')
              ? 'shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-primary font-bold bg-surface-container'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="font-body-md text-body-sm font-medium">Settings</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-error hover:bg-error-container/20 transition-colors text-body-sm"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-body-md text-body-sm font-medium">Log Out</span>
        </button>
      </div>
    </nav>
  );
};

export default AdminSidebar;
