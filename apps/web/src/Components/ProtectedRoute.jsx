import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

export const ProtectedRoute = ({ children, requirePremium = false }) => {
  const { user, isPremium, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  if (loading) {
    return <LoadingScreen type="route" />;
  }

  if (!user || !token) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requirePremium && !isPremium) {
    return <Navigate to="/premium" replace />;
  }

  return children;
};

export default ProtectedRoute;
