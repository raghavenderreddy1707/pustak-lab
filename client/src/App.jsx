import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'

import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import BrowsePage from '@/pages/BrowsePage'
import NoteDetailPage from '@/pages/NoteDetailPage'
import UploadPage from '@/pages/UploadPage'
import DashboardPage from '@/pages/DashboardPage'
import AdminPage from '@/pages/AdminPage'
import ProfilePage from '@/pages/ProfilePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import NotFoundPage from '@/pages/NotFoundPage'

import { useThemeStore, useAuthStore } from '@/store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min
      retry: 1,
    },
  },
})

function AppContent() {
  const { init } = useThemeStore()
  const { logout } = useAuthStore()

  useEffect(() => {
    init()
    // Listen for auth:logout events (from axios interceptor)
    const handler = () => logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset/:token" element={<ResetPasswordPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/notes/:id" element={<NoteDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/upload" element={
              <ProtectedRoute><UploadPage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #1e293b)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            padding: '10px 16px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </Router>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
