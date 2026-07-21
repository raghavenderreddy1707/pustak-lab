import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, BookOpen, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { authAPI } from '@/api'
import { getErrorMessage } from '@/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authAPI.forgotPassword(data)
      setSent(true)
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
            Reset Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
                Check your inbox
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                We sent a password reset link to <strong>{getValues('email')}</strong>. Check your spam folder if you don't see it.
              </p>
              <Link to="/auth" className="btn-primary w-full">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@university.edu"
                  />
                </div>
                {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <Link to="/auth" className="btn-ghost w-full justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
