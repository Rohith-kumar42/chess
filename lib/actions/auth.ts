'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { authLimiter } from '@/lib/rate-limit'
import {
  assertPayloadSize,
  assertEmail,
  sanitizeText,
  ValidationError,
  MAX_SHORT_TEXT,
} from '@/lib/validation'

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
  // ── Payload size guard ────────────────────────────────────────────────
  try {
    assertPayloadSize(formData)
  } catch (e) {
    return { success: false, error: (e as ValidationError).message }
  }

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

  // ── Input validation ──────────────────────────────────────────────────
  try {
    const rawEmail = String(formData.get('email') ?? '').trim()
    const rawPassword = String(formData.get('password') ?? '')

    if (!rawEmail || !rawPassword) {
      return { success: false, error: 'Email and password are required.' }
    }

    // Email: sanitise, format-check, length-cap
    const email = sanitizeText(rawEmail)
    if (email.length > MAX_SHORT_TEXT) {
      return { success: false, error: 'Email address is too long.' }
    }
    assertEmail('email', email)

    // Password: length-cap only (no sanitisation — passwords are hashed server-side)
    if (rawPassword.length > 128) {
      return { success: false, error: 'Password is too long.' }
    }

    // ── Authenticate via Supabase ─────────────────────────────────────────
    const supabase = await createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: rawPassword,
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
  } catch (e) {
    if (e instanceof ValidationError) {
      return { success: false, error: e.message }
    }
    throw e
  }
}
