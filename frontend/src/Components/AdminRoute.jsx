import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * AdminRoute
 *
 * A route guard that restricts access to administrator accounts only.
 * - Unauthenticated users → redirect to /login?redirect=/admin
 * - Authenticated users with role 'user' → redirect to /
 * - Authenticated users with role 'admin' → render children
 *
 * The role is derived server-side from GET /profile — never from localStorage.
 */
export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // loading screen handled by AuthProvider
  }

  if (!user) {
    const destination = location.pathname + location.search + location.hash;
    return <Navigate to={`/login?redirect=${encodeURIComponent(destination)}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

