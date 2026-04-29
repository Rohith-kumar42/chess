'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { authLimiter } from '@/lib/rate-limit'

export interface LoginResult {
  success: boolean
  role?: string
  error?: string
  /** Seconds until the rate-limit window resets (only when rate-limited). */
  retryAfterSeconds?: number
}

/**
 * Server Action for login — wraps Supabase auth behind a strict rate limit
 * of 5 attempts per 15 minutes per IP address.
 */
export async function loginAction(formData: FormData): Promise<LoginResult> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || headersList.get('x-real-ip') || 'unknown'

  // ── Rate-limit check ──────────────────────────────────────────────────
  const limiterKey = `auth:${ip}`
  const { success: allowed, remaining, resetAt } = authLimiter.check(limiterKey)

  if (!allowed) {
    const retryAfterSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000)
    return {
      success: false,
      error: `Too many login attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
      retryAfterSeconds,
    }
  }

  // ── Authenticate via Supabase ─────────────────────────────────────────
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  // ── Determine user role for redirect ──────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  return {
    success: true,
    role: profile?.role || 'student',
  }
}
