'use client'

import { useState } from 'react'
import { loginAction } from '@/lib/actions/auth'
import { KnightIcon } from '@/components/icons/ChessPieces'
import ThemeToggle from '@/components/shared/ThemeToggle'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRetryAfter(null)

    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)

    if (!result.success) {
      setError(result.error ?? 'Login failed.')
      if (result.retryAfterSeconds) {
        setRetryAfter(result.retryAfterSeconds)
      }
      setLoading(false)
      return
    }

    // Redirect based on role — full navigation to refresh middleware session
    const role = result.role || 'student'
    if (role === 'admin') {
      window.location.href = '/admin/dashboard'
    } else if (role === 'parent') {
      window.location.href = '/parent/dashboard'
    } else {
      window.location.href = '/student/dashboard'
    }
  }

  const isRateLimited = retryAfter !== null && retryAfter > 0

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-surface border border-border p-8 rounded-xl shadow-xl animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 mb-4">
              <KnightIcon size={24} className="text-accent" />
            </div>
            <h1
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Welcome Back
            </h1>
            <p className="text-foreground-muted text-sm mt-1">Sign in to Chess Academy</p>
          </div>

          {/* Error */}
          {error && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm animate-fade-in ${
                isRateLimited
                  ? 'bg-warning/10 border border-warning/20 text-warning'
                  : 'bg-danger/10 border border-danger/20 text-danger'
              }`}
            >
              <div className="flex items-start gap-2">
                {isRateLimited && (
                  <svg
                    className="w-4 h-4 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
                    />
                  </svg>
                )}
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground-muted mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-raised border border-border text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground-muted mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-raised border border-border text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || isRateLimited}
              className="w-full py-2.5 rounded-lg bg-accent text-primary-foreground font-semibold hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : isRateLimited ? (
                'Too many attempts'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-foreground-subtle mt-6">
            Contact your administrator for account access
          </p>
        </div>
      </div>
    </div>
  )
}
