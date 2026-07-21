import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
