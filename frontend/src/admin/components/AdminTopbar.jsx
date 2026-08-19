import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminTopbar = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-[56px] bg-background/90 backdrop-blur-md border-b border-outline-variant/40 flex justify-end items-center px-6 z-40">
      {/* Trailing Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-on-surface-variant font-data-sm text-data-sm mr-2 hidden sm:flex">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span className="text-[11px] font-bold text-success uppercase tracking-wider">SYSTEM ONLINE</span>
        </div>

        <Link
          to="/admin/activity"
          className="text-on-surface-variant hover:text-primary transition-colors duration-200 relative p-1"
          title="System Logs"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </Link>
        <Link
          to="/admin/settings"
          className="text-on-surface-variant hover:text-primary transition-colors duration-200 p-1"
          title="System Settings"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </Link>

        {/* Profile Badge */}
        <Link
          to="/admin/profile"
          className="flex items-center gap-2 pl-2 border-l border-outline-variant/30 hover:opacity-85 transition-opacity"
          title="Admin Profile"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-body-sm font-medium text-on-surface hidden md:inline">
            {user?.name || 'Administrator'}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default AdminTopbar;
