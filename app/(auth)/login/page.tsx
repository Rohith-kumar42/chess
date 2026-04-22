'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Fetch user role to redirect appropriately
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role || 'student'
    
    if (role === 'admin') {
      window.location.href = '/admin/dashboard'
    } else if (role === 'parent') {
      window.location.href = '/parent/dashboard'
    } else {
      window.location.href = '/student/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 chess-pattern pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="glass-card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-4">
              <span className="text-2xl">♛</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-foreground-muted text-sm mt-1">Sign in to Chess Academy</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
              {error}
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground-muted mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
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
