import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ScrollToTop } from '@/components/ScrollToTop';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import KnowledgePage from '@/pages/KnowledgePage';
import HerbDetailPage from '@/pages/HerbDetailPage';
import AssessmentPage from '@/pages/AssessmentPage';
import ResultsPage from '@/pages/ResultsPage';
import AssistantPage from '@/pages/AssistantPage';
import HistoryPage from '@/pages/HistoryPage';
import PrivacyPage from '@/pages/PrivacyPage';
import SafetyPage from '@/pages/SafetyPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/knowledge/:id" element={<HerbDetailPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <AssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <AssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <ProtectedRoute>
                <PrivacyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
