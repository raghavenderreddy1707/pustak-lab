import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, BookOpen, Mail, Lock, User, GraduationCap, BookMarked, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { authAPI } from '@/api'
import { getErrorMessage } from '@/utils'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  university: z.string().min(2, 'Enter your university name'),
  course: z.string().min(1, 'Select your course'),
})

function FormField({ label, error, children, icon: Icon }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <div className={Icon ? '[&>input]:pl-10 [&>select]:pl-10' : ''}>{children}</div>
      </div>
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loginForm = useForm({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm({ resolver: zodResolver(registerSchema) })

  const currentForm = mode === 'login' ? loginForm : registerForm

  const handleLogin = async (data) => {
    setIsLoading(true)
    try {
      const res = await authAPI.login(data)
      setAuth(res.data.data)
      toast.success(`Welcome back, ${res.data.data.user.name.split(' ')[0]}!`)
      const redirect = searchParams.get('redirect')
      navigate(redirect || '/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data) => {
    setIsLoading(true)
    try {
      const res = await authAPI.register(data)
      setAuth(res.data.data)
      toast.success('Account created! Welcome to Pustak Lab 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    const url = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`
    window.location.href = url
  }

  const COURSES = [
    'B.Tech / B.E.', 'B.Sc', 'BCA', 'BBA', 'B.Com',
    'M.Tech / M.E.', 'M.Sc', 'MCA', 'MBA', 'M.Com', 'PhD', 'Other'
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            {mode === 'login' ? 'Welcome back' : 'Join Pustak Lab'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {mode === 'login'
              ? 'Sign in to access your study materials'
              : 'Create a free account and start sharing notes'}
          </p>
        </div>

        <div className="card p-6">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700/50 p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleAuth}
            className="btn-secondary w-full mb-4 gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 divider" />
            <span className="text-xs text-slate-400">or with email</span>
            <div className="flex-1 divider" />
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField label="Email Address" error={loginForm.formState.errors.email?.message} icon={Mail}>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  className={`input ${loginForm.formState.errors.email ? 'input-error' : ''}`}
                  placeholder="you@university.edu"
                />
              </FormField>

              <FormField label="Password" error={loginForm.formState.errors.password?.message} icon={Lock}>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${loginForm.formState.errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>

              <div className="flex justify-end">
                <Link to="/auth/forgot" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <FormField label="Full Name" error={registerForm.formState.errors.name?.message} icon={User}>
                <input
                  {...registerForm.register('name')}
                  className={`input ${registerForm.formState.errors.name ? 'input-error' : ''}`}
                  placeholder="Rahul Sharma"
                />
              </FormField>

              <FormField label="Email Address" error={registerForm.formState.errors.email?.message} icon={Mail}>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  className={`input ${registerForm.formState.errors.email ? 'input-error' : ''}`}
                  placeholder="you@university.edu"
                />
              </FormField>

              <FormField label="University" error={registerForm.formState.errors.university?.message} icon={GraduationCap}>
                <input
                  {...registerForm.register('university')}
                  className={`input ${registerForm.formState.errors.university ? 'input-error' : ''}`}
                  placeholder="e.g. Anna University, Mumbai University"
                />
              </FormField>

              <FormField label="Course / Degree" error={registerForm.formState.errors.course?.message} icon={BookMarked}>
                <select
                  {...registerForm.register('course')}
                  className={`input ${registerForm.formState.errors.course ? 'input-error' : ''}`}
                >
                  <option value="">Select your course</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>

              <FormField label="Password" error={registerForm.formState.errors.password?.message} icon={Lock}>
                <div className="relative">
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${registerForm.formState.errors.password ? 'input-error' : ''}`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? 'Creating account…' : 'Create Account'}
              </button>

              <p className="text-xs text-slate-400 text-center">
                By registering, you agree to share notes responsibly.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
