import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-text-main mb-2">Page not found</h1>
        <p className="text-text-muted mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/"
          className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dk transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}