import { Link } from 'react-router-dom';

/**
 * Site-wide footer. Didn't exist before this and was added specifically so the
 * new Privacy Policy & Terms page has an actual discoverable link on
 * every page, rather than being reachable only by typing the URL directly.
 */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
        <p>© {new Date().getFullYear()} CivicPulse · Kigali, Rwanda</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy &amp; Terms of Use
          </Link>
          <a href="mailto:l.tona@alustudent.com" className="hover:text-primary transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
