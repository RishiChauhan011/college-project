import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 bg-surface-bright dark:bg-surface-dim shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] shadow-md hidden md:flex">
      <div className="flex items-center gap-8">
        <Link className="text-headline-md font-headline-md font-bold text-waypoint dark:text-tertiary-fixed-dim tracking-tight" to="/">PathFinder AI</Link>
        <div className="flex items-center gap-6">
          <Link 
            className={`pb-1 text-headline-md font-headline-md transition-colors duration-200 ${currentPath === '/dashboard' ? 'text-primary dark:text-primary-fixed border-b-2 border-primary font-bold scale-95 transition-transform' : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed'}`} 
            to="/dashboard"
          >
            Dashboard
          </Link>
          <Link 
            className={`pb-1 text-headline-md font-headline-md transition-colors duration-200 ${currentPath === '/roadmap' ? 'text-primary dark:text-primary-fixed border-b-2 border-primary font-bold scale-95 transition-transform' : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed'}`} 
            to="/roadmap"
          >
            Roadmap
          </Link>
          <Link 
            className={`pb-1 text-headline-md font-headline-md transition-colors duration-200 ${currentPath === '/about' ? 'text-primary dark:text-primary-fixed border-b-2 border-primary font-bold scale-95 transition-transform' : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed'}`} 
            to="/about"
          >
            About
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to="/pathfinder"
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-data-sm text-data-sm elevation-1 hover:scale-95 transition-transform"
        >
          Career Selector
        </Link>
        <button onClick={() => !user ? navigate('/login') : navigate('/dashboard')} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full elevation-1">
          <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
