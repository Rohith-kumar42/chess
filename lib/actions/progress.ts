'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { enforceActionRateLimit } from '@/lib/actions/rate-limit-guard'
import {
  assertPayloadSize,
  assertUUID,
  requireText,
  optionalText,
  optionalNumber,
  assertDate,
  assertEnum,
  sanitizeText,
  MAX_MEDIUM_TEXT,
} from '@/lib/validation'
import type { ProgressEntry } from '@/types/app.types'

// ─── Allowed enum values ──────────────────────────────────────────────────────
const SKILL_LEVELS   = ['beginner', 'intermediate', 'advanced', 'expert'] as const
const GAME_RESULTS   = ['win', 'loss', 'draw', 'n/a'] as const

/** Max items in a comma-separated list (openings, tactics) */
const MAX_LIST_ITEMS = 20
const MAX_ITEM_LEN   = 80  // chars per item

function sanitizeCSVList(raw: string): string[] {
  return raw
    .split(',')
    .map(s => sanitizeText(s))
    .filter(Boolean)
    .slice(0, MAX_LIST_ITEMS)
    .map(s => s.substring(0, MAX_ITEM_LEN))
}

export async function createProgressEntry(formData: FormData) {
  await enforceActionRateLimit()
  assertPayloadSize(formData)

  const studentId = requireText(formData, 'student_id')
  assertUUID('student_id', studentId)

  const entryDate = optionalText(formData, 'entry_date') ?? new Date().toISOString().split('T')[0]
  assertDate('entry_date', entryDate)

  const rawLevel = optionalText(formData, 'skill_level')
  const skillLevel = rawLevel ? assertEnum('skill_level', rawLevel, SKILL_LEVELS) : null

  const ratingBefore = optionalNumber(formData, 'rating_before', { min: 0, max: 4000 })
  const ratingAfter  = optionalNumber(formData, 'rating_after',  { min: 0, max: 4000 })

  const rawGameResult = optionalText(formData, 'game_result')
  const gameResult    = rawGameResult
    ? assertEnum('game_result', rawGameResult, GAME_RESULTS)
    : null

  const rawOpenings = formData.get('openings_studied')
    ? String(formData.get('openings_studied'))
    : null
  const openingsStudied = rawOpenings ? sanitizeCSVList(rawOpenings) : null

  const rawTactics  = formData.get('tactics_topics')
    ? String(formData.get('tactics_topics'))
    : null
  const tacticsTopics = rawTactics ? sanitizeCSVList(rawTactics) : null

  const coachRemarks    = optionalText(formData, 'coach_remarks',    MAX_MEDIUM_TEXT) ?? ''
  const areasToImprove  = optionalText(formData, 'areas_to_improve', MAX_MEDIUM_TEXT)
  const homework        = optionalText(formData, 'homework',         MAX_MEDIUM_TEXT)

  const rawSessionId = optionalText(formData, 'session_id')
  if (rawSessionId) assertUUID('session_id', rawSessionId)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('progress_entries').insert({
    student_id:       studentId,
    entry_date:       entryDate,
    skill_level:      skillLevel,
    rating_before:    ratingBefore,
    rating_after:     ratingAfter,
    game_result:      gameResult,
    openings_studied: openingsStudied,
    tactics_topics:   tacticsTopics,
    coach_remarks:    coachRemarks,
    areas_to_improve: areasToImprove,
    homework,
    coach_id:         user?.id ?? null,
    session_id:       rawSessionId,
  })

  if (error) throw new Error(error.message)

  // Update student skill level if provided
  if (skillLevel) {
    await supabase
      .from('students')
      .update({ skill_level: skillLevel })
      .eq('id', studentId)
  }

  revalidatePath('/admin/progress')
  revalidatePath(`/admin/progress/${studentId}`)
  revalidatePath(`/admin/students/${studentId}`)
}

// ─── Read-only helpers ────────────────────────────────────────────────────────

export interface RatingHistoryPoint {
  date:   string
  rating: number
}

export interface ProgressData {
  entries:           ProgressEntry[]
  ratingHistory:     RatingHistoryPoint[]
  winRate:           number
  totalWins:         number
  totalLosses:       number
  totalDraws:        number
  totalGames:        number
  attendancePercent: number
}

export async function getProgressForStudent(studentId: string): Promise<ProgressData> {
  assertUUID('studentId', studentId)
  const supabase = await createClient()

  const { data: entries, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('student_id', studentId)
    .order('entry_date', { ascending: true })

  if (error) throw new Error(error.message)

  const all = (entries ?? []) as ProgressEntry[]

  const ratingHistory: RatingHistoryPoint[] = all
    .filter(e => e.rating_after !== null)
    .map(e => ({ date: e.entry_date, rating: e.rating_after! }))

  const gamesWithResult = all.filter(e => e.game_result && e.game_result !== 'n/a')
  const totalGames  = gamesWithResult.length
  const totalWins   = gamesWithResult.filter(e => e.game_result === 'win').length
  const totalLosses = gamesWithResult.filter(e => e.game_result === 'loss').length
  const totalDraws  = gamesWithResult.filter(e => e.game_result === 'draw').length
  const winRate     = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentEntries = all.filter(e => new Date(e.entry_date) >= thirtyDaysAgo)
  const expectedSessions = 4
  const attendancePercent = Math.min(
    100,
    Math.round((recentEntries.length / expectedSessions) * 100)
  )

  return {
    entries: all,
    ratingHistory,
    winRate,
    totalWins,
    totalLosses,
    totalDraws,
    totalGames,
    attendancePercent,
  }
}
