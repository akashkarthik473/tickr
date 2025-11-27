/**
 * Protected route guard component
 * Redirects unapproved users to waitlist when lockdown mode is enabled.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../store/user';

const LOCKDOWN = import.meta.env.VITE_LOCKDOWN === 'true';

/**
 * Route guard that protects routes during lockdown mode
 * @param {Object} props
 * @param {JSX.Element} props.children - Child components to render if allowed
 * @param {boolean} [props.requireAuth=true] - Whether authentication is required
 */
export default function Protected({ children, requireAuth = true }) {
  // Use selectors for Zustand to avoid unnecessary re-renders
  const user = useUser((state) => state.user);
  const loading = useUser((state) => state.loading);
  const lockdown = useUser((state) => state.lockdown);
  const location = useLocation();

  // If lockdown is disabled (both env and store), render children directly
  if (!LOCKDOWN && !lockdown) {
    return children;
  }

  // Show nothing while loading (or could show a spinner)
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If auth required but no user, redirect to signin
  if (requireAuth && !user) {
    return <Navigate to={`/signin?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If lockdown enabled and user not approved, redirect to waitlist
  if ((LOCKDOWN || lockdown) && user && !user.approved) {
    return <Navigate to={`/waitlist?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

