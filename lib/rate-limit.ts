/**
 * In-memory sliding window rate limiter.
 *
 * Each key (typically an IP address) maintains a list of timestamps within the
 * current window. When the count exceeds `maxAttempts`, further requests are
 * rejected until enough timestamps age out of the window.
 *
 * Suitable for single-instance deployments. For horizontally-scaled
 * production setups, swap the in-memory Map for Redis or similar.
 */

interface RateLimitEntry {
  timestamps: number[]
}

export interface RateLimitResult {
  /** Whether the request is allowed. */
  success: boolean
  /** How many requests remain in the current window. */
  remaining: number
  /** When the window resets (based on the oldest entry). */
  resetAt: Date
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private readonly windowMs: number
  private readonly maxAttempts: number

  constructor(options: { windowMs: number; maxAttempts: number }) {
    this.windowMs = options.windowMs
    this.maxAttempts = options.maxAttempts

    // Periodic cleanup every 5 minutes to prevent memory leaks
    const interval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
    // Don't keep the Node process alive just for cleanup
    if (interval?.unref) {
      interval.unref()
    }
  }

  /**
   * Check (and consume) a rate-limit token for the given key.
   * Returns whether the request is allowed plus metadata.
   */
  check(key: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.windowMs

    let entry = this.store.get(key)

    if (!entry) {
      entry = { timestamps: [] }
      this.store.set(key, entry)
    }

    // Discard timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

    const remaining = Math.max(0, this.maxAttempts - entry.timestamps.length)
    const oldestInWindow = entry.timestamps[0] ?? now
    const resetAt = new Date(oldestInWindow + this.windowMs)

    if (entry.timestamps.length >= this.maxAttempts) {
      return { success: false, remaining: 0, resetAt }
    }

    // Consume a token
    entry.timestamps.push(now)
    return { success: true, remaining: remaining - 1, resetAt }
  }

  /** Remove stale entries to free memory. */
  private cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.windowMs

    for (const [key, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => t > windowStart)
      if (entry.timestamps.length === 0) {
        this.store.delete(key)
      }
    }
  }
}

// ─── Pre-configured instances ───────────────────────────────────────────────

/** Authentication routes: 5 attempts per 15 minutes. */
export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
})

/** General page/API routes: 100 requests per minute. */
export const generalLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxAttempts: 100,
})

/** Server-action mutations: 30 requests per minute. */
export const actionLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxAttempts: 30,
})
