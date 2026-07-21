import { Link } from 'react-router-dom'
import { BookOpen, Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="text-center max-w-md animate-slide-up">
        <div className="text-8xl mb-6">📭</div>
        <h1 className="font-display font-bold text-4xl text-slate-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link to="/browse" className="btn-secondary">
            <Search className="w-4 h-4" /> Browse Notes
          </Link>
        </div>
      </div>
    </div>
  )
}
