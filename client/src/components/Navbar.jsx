import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  BookOpen, Search, Upload, Moon, Sun, Menu, X, Bell,
  User, LogOut, LayoutDashboard, Shield, Trophy, ChevronDown,
  BookMarked
} from 'lucide-react'
import { useAuthStore, useThemeStore } from '@/store'
import { cn } from '@/utils'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef(null)

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const navLinks = [
    { to: '/browse', label: 'Browse' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/50 dark:border-slate-700/50">
      <nav className="container-app">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Pustak<span className="gradient-text"> Lab</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects, universities…"
                className="input pl-9 pr-4 h-9 text-sm"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname.startsWith(link.to)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="btn-icon btn-ghost text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Upload button */}
                <Link to="/upload" className="btn-primary btn-sm hidden sm:flex">
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </Link>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (user?.name?.[0] || 'U').toUpperCase()
                      )}
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500 transition-transform hidden sm:block', userMenuOpen && 'rotate-180')} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 card shadow-lg py-1 animate-in z-50">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to={`/profile/${user?._id}`} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link to="/dashboard?tab=bookmarks" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <BookMarked className="w-4 h-4" /> Bookmarks
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-slate-100 dark:border-slate-700 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-ghost btn-sm text-slate-600 dark:text-slate-300">
                  Sign In
                </Link>
                <Link to="/auth?mode=register" className="btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-icon btn-ghost md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 dark:border-slate-700 mt-1 pt-3 animate-slide-down">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes…"
                  className="input pl-9"
                />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/upload"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary mt-2"
                >
                  <Upload className="w-4 h-4" /> Upload Notes
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
