import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // If no user after loading is complete, redirect to login
  if (!user) {
    // Save the intended destination so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access if required
  // Allow access if role === 'admin' OR isAdmin === true (handle both strict and truthy checks)
  if (adminOnly) {
    const isAdmin = user.role === 'admin' || user.isAdmin === true || user.isAdmin === 'true';
    if (!isAdmin) {
      // User is logged in but not an admin - redirect to home
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
