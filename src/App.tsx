import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppLayout, PublicLayout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Assessment } from '@/pages/Assessment'
import { Assistant } from '@/pages/Assistant'
import { KnowledgeBase } from '@/pages/KnowledgeBase'
import { History } from '@/pages/History'
import { Privacy } from '@/pages/Privacy'
import { Profile } from '@/pages/Profile'
import { Admin } from '@/pages/Admin'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated app */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="assessment" element={<Assessment />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="knowledge" element={<KnowledgeBase embedded />} />
              <Route path="history" element={<History />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
