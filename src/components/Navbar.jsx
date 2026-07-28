import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-primary font-bold text-xl tracking-tight">CivicPulse</span>
        <span className="hidden sm:inline text-xs text-text-muted bg-bg px-2 py-0.5 rounded-full border border-border">
          Rwanda
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-4 text-sm font-medium">

        <Link to="/" className="text-text-muted hover:text-primary transition-colors">
          Heatmap
        </Link>

        <Link to="/scorecard" className="text-text-muted hover:text-primary transition-colors">
          Scorecard
        </Link>

        <Link to="/resolved" className="text-text-muted hover:text-primary transition-colors text-sm font-medium">
          Resolved
        </Link>

        {user ? (
          <>
            {/* Dashboard link is now INSIDE the logged-in block and appears
                BEFORE the user name and logout button. Previously it was placed
                after the logout button causing the nav to read:
                "Name · Official | Log out | Dashboard" which looked broken.
                Now it reads: "Dashboard | Name · Official | Log out" */}
            {user.role === 'official' && (
              <Link
                to="/dashboard"
                className="text-text-muted hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}

            <span className="text-text-muted hidden sm:inline">
              {user.name} · <span className="capitalize">{user.role}</span>
            </span>

            <Link
              to="/account"
              className="text-text-muted hover:text-primary transition-colors"
            >
              My Account
            </Link>

            <button
              onClick={handleLogout}
              className="bg-bg border border-border text-text-main px-3 py-1.5 rounded-lg hover:border-danger hover:text-danger transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/auth/citizen"
            className="bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary-dk transition-colors text-sm font-medium"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}