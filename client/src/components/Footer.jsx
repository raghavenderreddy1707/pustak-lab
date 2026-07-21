import { Link } from 'react-router-dom'
import { BookOpen, ExternalLink, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Pustak <span className="gradient-text">Lab</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              The free, crowdsourced platform where students share study materials — notes, question papers, assignments, and more.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> for students, by students
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { to: '/browse', label: 'Browse Notes' },
                { to: '/upload', label: 'Upload Notes' },
                { to: '/leaderboard', label: 'Leaderboard' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Community</h4>
            <ul className="space-y-2">
              {[
                { to: '/auth?mode=register', label: 'Join Free' },
                { to: '/auth', label: 'Sign In' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Pustak Lab. Free to use. Free forever.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
