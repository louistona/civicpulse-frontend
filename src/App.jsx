import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar             from './components/Navbar';
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
        <Navbar />
        <main className="min-h-screen bg-bg">
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

            {/* Citizen protected */}
            <Route path="/submit"
              element={
                <PrivateRoute requiredRole="citizen">
                  <SubmitReportPage />
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
      </BrowserRouter>
    </AuthProvider>
  );
}