import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

// Pages that must never be used as a redirect destination (would loop)
const LOOP_GUARD = new Set(['/login', '/register', '/forgot']);

export const ProtectedRoute = ({ children, requirePremium = false }) => {
  const { user, isPremium, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  if (loading) {
    return <LoadingScreen type="route" />;
  }

  if (!user || !token) {
    // Encode the full attempted URL (pathname + search + hash) as the ?redirect= param.
    // Using the full URL ensures query-strings like ?plan=yearly survive the round-trip.
    const destination = location.pathname + location.search + location.hash;
    const isSafe =
      destination.startsWith('/') &&
      !destination.startsWith('//') &&
      !LOOP_GUARD.has(location.pathname);

    const loginUrl = isSafe
      ? `/login?redirect=${encodeURIComponent(destination)}`
      : '/login';

    return <Navigate to={loginUrl} replace />;
  }

  if (requirePremium && !isPremium) {
    return <Navigate to="/premium" replace />;
  }

  return children;
};

export default ProtectedRoute;

