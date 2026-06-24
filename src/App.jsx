import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ReportDetailPage from './pages/ReportDetailPage';
import SubmitReportPage from './pages/SubmitReportPage';
import ScorecardPage     from './pages/ScorecardPage';
import OfficialDashboardPage from './pages/OfficialDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Protects routes that require login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center mt-20 text-text-muted">Loading...</div>;
  return user ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen bg-bg">
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/auth"         element={<AuthPage />} />
            <Route path="/reports/:id"  element={<ReportDetailPage />} />
            <Route path="/scorecard"    element={<ScorecardPage />} />  
            <Route path="/submit" element={<SubmitReportPage />} />
            <Route
              path="/dashboard"
              element={<PrivateRoute><OfficialDashboardPage /></PrivateRoute>}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}