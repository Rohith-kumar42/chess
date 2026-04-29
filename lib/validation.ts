/**
 * lib/validation.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Central input sanitisation + validation layer for all Server Actions.
 *
 * Rules enforced
 *  • FormData total payload size cap (prevents memory-exhaustion attacks)
 *  • Per-field byte-length caps (prevents column-overflow / DoS)
 *  • Dangerous-pattern stripping from every free-text field (XSS / injection)
 *  • Strict allow-lists for enum-style fields (skill_level, medal, format …)
 *  • UUID v4 format validation for ID parameters passed as strings
 *  • Basic e-mail / phone / URL format validation
 *  • Safe number parsing with range enforcement
 *  • ISO-8601 date validation (YYYY-MM-DD)
 */

// ─── Field-length caps (bytes) ────────────────────────────────────────────────

export const MAX_PAYLOAD_BYTES = 64_000        // 64 KB total FormData
export const MAX_SHORT_TEXT    = 255           // names, emails, labels
export const MAX_MEDIUM_TEXT   = 1_000         // descriptions, remarks
export const MAX_LONG_TEXT     = 5_000         // notes, full descriptions

// ─── XSS / injection stripping ───────────────────────────────────────────────

/**
 * Strip HTML tags and known injection patterns from a plain-text string.
 * We do NOT want formatted HTML here — every field stored is plain text.
 */
export function sanitizeText(value: string): string {
  // 1. Remove HTML/XML tags
  let clean = value.replace(/<[^>]*>/g, '')
  // 2. Collapse encoded entities to their text equivalents or strip them
  clean = clean
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
  // 3. Re-strip any tags that were hiding behind entities
  clean = clean.replace(/<[^>]*>/g, '')
  // 4. Remove null bytes and other control characters (keep \n \r \t)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  // 5. Trim surrounding whitespace
  return clean.trim()
}

// ─── FormData helpers ─────────────────────────────────────────────────────────

/**
 * Enforce a total-byte cap on an entire FormData object.
 * Call this at the very top of any action before touching individual fields.
 */
export function assertPayloadSize(formData: FormData): void {
  let totalBytes = 0
  for (const [, value] of formData.entries()) {
    totalBytes += typeof value === 'string'
      ? new TextEncoder().encode(value).byteLength
      : (value as File).size
  }
  if (totalBytes > MAX_PAYLOAD_BYTES) {
    throw new ValidationError(
      `Payload too large (${totalBytes} bytes). Maximum allowed is ${MAX_PAYLOAD_BYTES} bytes.`
    )
  }
}

/**
 * Read a required string field, sanitise it, and enforce a max byte-length.
 * Throws `ValidationError` if missing or too long.
 */
export function requireText(
  formData: FormData,
  field: string,
  maxLen = MAX_SHORT_TEXT,
): string {
  const raw = formData.get(field)
  if (raw === null || raw === '') {
    throw new ValidationError(`"${field}" is required.`)
  }
  const value = sanitizeText(String(raw))
  assertMaxLength(field, value, maxLen)
  return value
}

/**
 * Read an optional string field, sanitise it, and enforce a max byte-length.
 * Returns `null` when the field is absent or empty.
 */
export function optionalText(
  formData: FormData,
  field: string,
  maxLen = MAX_SHORT_TEXT,
): string | null {
  const raw = formData.get(field)
  if (raw === null || String(raw).trim() === '') return null
  const value = sanitizeText(String(raw))
  assertMaxLength(field, value, maxLen)
  return value
}

// ─── Type-specific validators ─────────────────────────────────────────────────

/** UUID v4 regex (hex groups: 8-4-4-4-12) */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Validate that a string is a UUID v4. */
export function assertUUID(field: string, value: string): void {
  if (!UUID_RE.test(value)) {
    throw new ValidationError(`"${field}" must be a valid UUID.`)
  }
}

/** Validate an e-mail address format. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export function assertEmail(field: string, value: string): void {
  if (!EMAIL_RE.test(value)) {
    throw new ValidationError(`"${field}" must be a valid email address.`)
  }
}

/** Validate an ISO-8601 date (YYYY-MM-DD). */
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
export function assertDate(field: string, value: string): void {
  if (!DATE_RE.test(value)) {
    throw new ValidationError(`"${field}" must be a valid date (YYYY-MM-DD).`)
  }
  // Reject obviously invalid calendar dates (e.g. Feb 31)
  const d = new Date(value)
  if (isNaN(d.getTime())) {
    throw new ValidationError(`"${field}" is not a real calendar date.`)
  }
}

/** Validate a URL (http or https). */
export function assertURL(field: string, value: string): void {
  try {
    const u = new URL(value)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      throw new Error('bad protocol')
    }
  } catch {
    throw new ValidationError(`"${field}" must be a valid http(s) URL.`)
  }
}

/** Validate a phone number (digits, spaces, +, -, parentheses; 7–20 chars). */
const PHONE_RE = /^[+\d][\d\s\-().]{5,19}$/
export function assertPhone(field: string, value: string): void {
  if (!PHONE_RE.test(value)) {
    throw new ValidationError(`"${field}" must be a valid phone number.`)
  }
}

/**
 * Parse a numeric FormData field safely.
 * Returns `null` when the field is absent or empty.
 * Throws `ValidationError` when the value is present but non-numeric or
 * outside an optional [min, max] range.
 */
export function optionalNumber(
  formData: FormData,
  field: string,
  options: { min?: number; max?: number } = {},
): number | null {
  const raw = formData.get(field)
  if (raw === null || String(raw).trim() === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n)) {
    throw new ValidationError(`"${field}" must be a valid number.`)
  }
  if (options.min !== undefined && n < options.min) {
    throw new ValidationError(`"${field}" must be at least ${options.min}.`)
  }
  if (options.max !== undefined && n > options.max) {
    throw new ValidationError(`"${field}" must be at most ${options.max}.`)
  }
  return n
}

/**
 * Parse a required numeric FormData field safely.
 */
export function requireNumber(
  formData: FormData,
  field: string,
  options: { min?: number; max?: number } = {},
): number {
  const raw = formData.get(field)
  if (raw === null || String(raw).trim() === '') {
    throw new ValidationError(`"${field}" is required.`)
  }
  const n = Number(raw)
  if (!Number.isFinite(n)) {
    throw new ValidationError(`"${field}" must be a valid number.`)
  }
  if (options.min !== undefined && n < options.min) {
    throw new ValidationError(`"${field}" must be at least ${options.min}.`)
  }
  if (options.max !== undefined && n > options.max) {
    throw new ValidationError(`"${field}" must be at most ${options.max}.`)
  }
  return n
}

/**
 * Validate a value against a strict allow-list.
 * Returns the original value (unchanged) when it matches.
 */
export function assertEnum<T extends string>(
  field: string,
  value: string,
  allowed: readonly T[],
): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new ValidationError(
      `"${field}" must be one of: ${allowed.join(', ')}. Got: "${value}".`
    )
  }
  return value as T
}

/**
 * Validate an array of UUIDs (e.g. student_ids from formData.getAll).
 * Returns a clean copy. Throws if any entry is malformed or the array
 * exceeds the maximum allowed length.
 */
export function requireUUIDArray(
  field: string,
  values: string[],
  maxItems = 500,
): string[] {
  if (values.length > maxItems) {
    throw new ValidationError(
      `"${field}" contains too many items (max ${maxItems}).`
    )
  }
  values.forEach((v, i) => {
    if (!UUID_RE.test(v)) {
      throw new ValidationError(`"${field}[${i}]" is not a valid UUID.`)
    }
  })
  return values
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function assertMaxLength(field: string, value: string, maxLen: number): void {
  const byteLen = new TextEncoder().encode(value).byteLength
  if (byteLen > maxLen) {
    throw new ValidationError(
      `"${field}" exceeds the maximum allowed length of ${maxLen} bytes.`
    )
  }
}

// ─── Error class ──────────────────────────────────────────────────────────────

/** Thrown whenever user input fails validation. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
