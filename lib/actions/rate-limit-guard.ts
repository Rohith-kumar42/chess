'use server'

import { headers } from 'next/headers'
import { actionLimiter } from '@/lib/rate-limit'

/**
 * Enforce the action rate limit (30 req/min per IP) for any Server Action.
 * Call this at the top of every mutating server action.
 *
 * @throws Error with a user-friendly message when the limit is exceeded.
 */
export async function enforceActionRateLimit(): Promise<void> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'

  const { success, resetAt } = actionLimiter.check(`action:${ip}`)

  if (!success) {
    const retrySeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000)
    throw new Error(
      `Rate limit exceeded. Please wait ${retrySeconds} second(s) before trying again.`
    )
  }
}
