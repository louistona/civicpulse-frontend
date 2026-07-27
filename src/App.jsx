import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar             from './components/Navbar';
import Footer             from './components/Footer';
import HomePage           from './pages/HomePage';
import CitizenAuthPage    from './pages/CitizenAuthPage';
import OfficialAuthPage   from './pages/OfficialAuthPage';
import SubmitReportPage   from './pages/SubmitReportPage';
import ReportDetailPage   from './pages/ReportDetailPage';
import ScorecardPage      from './pages/ScorecardPage';
import OfficialDashboardPage from './pages/OfficialDashboardPage';
import VotingPage         from './pages/VotingPage';
import NotFoundPage       from './pages/NotFoundPage';
import ResolvedReportsPage from './pages/ResolvedReportsPage';
import PrivacyPolicyPage  from './pages/PrivacyPolicyPage';
import AccountPage        from './pages/AccountPage';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex justify-center mt-20 text-text-muted text-sm">Loading…</div>
  );
  if (!user) return <Navigate to="/auth/citizen" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 bg-bg">
            <Routes>
              {/* Public routes */}
              <Route path="/"               element={<HomePage />} />
              <Route path="/auth/citizen"   element={<CitizenAuthPage />} />
              <Route path="/auth/official"  element={<OfficialAuthPage />} />
              <Route path="/auth"           element={<Navigate to="/auth/citizen" replace />} />
              <Route path="/reports/:id"    element={<ReportDetailPage />} />
              <Route path="/scorecard"      element={<ScorecardPage />} />
              <Route path="/vote/:id"       element={<VotingPage />} />
              <Route path="/resolved" element={<ResolvedReportsPage />} />
              <Route path="/privacy"        element={<PrivacyPolicyPage />} />
              {/* FIX: /submit was wrapped in <PrivateRoute requiredRole="citizen">,
                  which redirected every logged-out visitor to /auth/citizen
                  before they could ever see the form — completely blocking
                  anonymous reporting at the routing layer, even though the
                  backend (optionalAuth on POST /reports) and SubmitReportPage
                  itself were both already built to support submitting without
                  an account. It's now a public route; SubmitReportPage handles
                  both logged-in and anonymous submitters itself. */}
              <Route path="/submit"         element={<SubmitReportPage />} />

              {/* Any logged-in user — citizen or official */}
              <Route path="/account"
                element={
                  <PrivateRoute>
                    <AccountPage />
                  </PrivateRoute>
                }
              />

              {/* Official protected */}
              <Route path="/dashboard"
                element={
                  <PrivateRoute requiredRole="official">
                    <OfficialDashboardPage />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}