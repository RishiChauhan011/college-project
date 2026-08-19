import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  // No token at all → send to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token exists but user profile is still loading (null) → show loading spinner
  // This prevents the race condition where user=null causes premature access decision
  if (user === null) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  // Profile loaded and user is NOT admin → access denied
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center font-body-md">
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-xl max-w-md w-full border border-error/20">
          <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <h2 className="text-headline-md font-headline-md text-on-surface font-bold mb-2">Access Restricted</h2>
          <p className="text-secondary text-body-sm mb-6">
            The requested area is strictly reserved for system administrators. Your current session does not possess administrative privileges.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-data-sm text-data-sm hover:bg-surface-tint transition-all"
            >
              Return to Student Dashboard
            </Link>
            <Link
              to="/login"
              className="text-secondary hover:text-on-surface text-body-sm font-medium transition-colors"
            >
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin confirmed → render admin content
  return children;
};

export default AdminProtectedRoute;

