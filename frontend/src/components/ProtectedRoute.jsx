import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isProfileComplete } from '../utils/profile';

const ProtectedRoute = ({ children, requireCompleteProfile = true }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user profile is still loading, show spinner
  if (user === null) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  // If an admin reaches a user-only route, redirect them to admin panel
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // If this route requires a completed profile and the user is incomplete, send to onboarding
  if (requireCompleteProfile && !isProfileComplete(user)) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;


