import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, BookOpen, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { authAPI } from '@/api'
import { getErrorMessage } from '@/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authAPI.resetPassword(token, { password: data.password })
      setDone(true)
      setTimeout(() => navigate('/auth'), 2500)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Set New Password
          </h1>
        </div>

        <div className="card p-6">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
                Password Updated!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Repeat your password"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-danger-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? 'Updating…' : 'Update Password'}
              </button>

              <Link to="/auth" className="btn-ghost w-full justify-center text-sm text-slate-500">
                Cancel
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
