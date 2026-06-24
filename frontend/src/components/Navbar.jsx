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
        

        {user ? (
          <>
            <span className="text-text-muted hidden sm:inline">
              {user.name} · <span className="capitalize">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-bg border border-border text-text-main px-3 py-1.5 rounded-lg hover:border-danger hover:text-danger transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <Link to="/submit"
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dk transition-colors">
            + Report Issue
          </Link>
        )}
        
        {user?.role === 'official' && (
          <Link to="/dashboard"
            className="text-text-muted hover:text-primary transition-colors text-sm font-medium">
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}