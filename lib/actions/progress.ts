'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { enforceActionRateLimit } from '@/lib/actions/rate-limit-guard'

export async function createProgressEntry(formData: FormData) {
  await enforceActionRateLimit()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const studentId = formData.get('student_id') as string
  const skillLevel = (formData.get('skill_level') as string) || null

  const { error } = await supabase.from('progress_entries').insert({
    student_id: studentId,
    entry_date: (formData.get('entry_date') as string) || new Date().toISOString().split('T')[0],
    skill_level: skillLevel,
    rating_before: formData.get('rating_before') ? Number(formData.get('rating_before')) : null,
    rating_after: formData.get('rating_after') ? Number(formData.get('rating_after')) : null,
    game_result: (formData.get('game_result') as string) || null,
    openings_studied: formData.get('openings_studied') 
      ? (formData.get('openings_studied') as string).split(',').map(s => s.trim()).filter(Boolean) 
      : null,
    tactics_topics: formData.get('tactics_topics')
      ? (formData.get('tactics_topics') as string).split(',').map(s => s.trim()).filter(Boolean)
      : null,
    coach_remarks: formData.get('coach_remarks') as string,
    areas_to_improve: (formData.get('areas_to_improve') as string) || null,
    homework: (formData.get('homework') as string) || null,
    coach_id: user?.id ?? null,
    session_id: (formData.get('session_id') as string) || null,
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

import type { ProgressEntry } from '@/types/app.types'

export interface RatingHistoryPoint {
  date: string
  rating: number
}

export interface ProgressData {
  entries: ProgressEntry[]
  ratingHistory: RatingHistoryPoint[]
  winRate: number
  totalWins: number
  totalLosses: number
  totalDraws: number
  totalGames: number
  attendancePercent: number
}

export async function getProgressForStudent(studentId: string): Promise<ProgressData> {
  const supabase = await createClient()

  const { data: entries, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('student_id', studentId)
    .order('entry_date', { ascending: true })

  if (error) throw new Error(error.message)

  const all = (entries ?? []) as ProgressEntry[]

  // Build rating history from entries that have rating_after
  const ratingHistory: RatingHistoryPoint[] = all
    .filter((e) => e.rating_after !== null)
    .map((e) => ({ date: e.entry_date, rating: e.rating_after! }))

  // Game results
  const gamesWithResult = all.filter(
    (e) => e.game_result && e.game_result !== 'n/a'
  )
  const totalGames = gamesWithResult.length
  const totalWins = gamesWithResult.filter((e) => e.game_result === 'win').length
  const totalLosses = gamesWithResult.filter((e) => e.game_result === 'loss').length
  const totalDraws = gamesWithResult.filter((e) => e.game_result === 'draw').length
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0

  // Attendance: entries in last 30 days vs expected (assume ~4 sessions/month)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentEntries = all.filter(
    (e) => new Date(e.entry_date) >= thirtyDaysAgo
  )
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
