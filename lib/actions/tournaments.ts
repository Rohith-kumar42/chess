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
  assertURL,
  assertEnum,
  MAX_MEDIUM_TEXT,
} from '@/lib/validation'
import type { Tournament, TournamentParticipant, Student } from '@/types/app.types'

// ─── Allowed enum values ──────────────────────────────────────────────────────
const TOURNAMENT_FORMATS = [
  'Swiss', 'Round Robin', 'Knockout', 'Rapid', 'Blitz', 'Classical', 'Online', 'Other',
] as const

const MEDALS = ['gold', 'silver', 'bronze', 'none'] as const

const TOURNAMENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const

// ─── Admin write actions ──────────────────────────────────────────────────────

export async function createTournament(formData: FormData) {
  await enforceActionRateLimit()
  assertPayloadSize(formData)

  const name     = requireText(formData, 'name')
  const organizer = optionalText(formData, 'organizer')
  const location  = optionalText(formData, 'location')

  const tournamentDate = requireText(formData, 'tournament_date')
  assertDate('tournament_date', tournamentDate)

  const endDate = optionalText(formData, 'end_date')
  if (endDate) assertDate('end_date', endDate)

  const rawFormat = optionalText(formData, 'format')
  const format    = rawFormat ? assertEnum('format', rawFormat, TOURNAMENT_FORMATS) : null

  const rawRegUrl = optionalText(formData, 'registration_url')
  if (rawRegUrl) assertURL('registration_url', rawRegUrl)

  const description = optionalText(formData, 'description', MAX_MEDIUM_TEXT)

  const supabase = await createClient()
  const { error } = await supabase.from('tournaments').insert({
    name,
    organizer,
    location,
    tournament_date:  tournamentDate,
    end_date:         endDate,
    format,
    registration_url: rawRegUrl,
    description,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tournaments')
}

export async function addTournamentParticipant(formData: FormData) {
  await enforceActionRateLimit()
  assertPayloadSize(formData)

  const tournamentId = requireText(formData, 'tournament_id')
  assertUUID('tournament_id', tournamentId)

  const studentId = requireText(formData, 'student_id')
  assertUUID('student_id', studentId)

  const rank               = optionalNumber(formData, 'rank',               { min: 1, max: 10_000 })
  const score              = optionalNumber(formData, 'score',              { min: 0, max: 100 })
  const performanceRating  = optionalNumber(formData, 'performance_rating', { min: 0, max: 4000 })

  const rawMedal = optionalText(formData, 'medal') ?? 'none'
  const medal    = assertEnum('medal', rawMedal, MEDALS)

  const notes = optionalText(formData, 'notes', MAX_MEDIUM_TEXT)

  const supabase = await createClient()
  const { error } = await supabase.from('tournament_participants').insert({
    tournament_id:      tournamentId,
    student_id:         studentId,
    rank,
    score,
    performance_rating: performanceRating,
    medal,
    notes,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tournaments')
}

export async function updateTournamentStatus(id: string, status: string) {
  await enforceActionRateLimit()
  assertUUID('id', id)
  assertEnum('status', status, TOURNAMENT_STATUSES)

  const supabase = await createClient()
  const { error } = await supabase
    .from('tournaments')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tournaments')
}

// ─── Student-facing read/write ────────────────────────────────────────────────

export interface TournamentWithRegistration extends Tournament {
  isRegistered: boolean
}

export interface PastTournament extends Tournament {
  rank:               number | null
  score:              number | null
  performance_rating: number | null
  medal:              string | null
  notes:              string | null
}

export interface StudentTournamentData {
  upcoming: TournamentWithRegistration[]
  past:     PastTournament[]
}

export async function getTournamentsForStudent(studentId: string): Promise<StudentTournamentData> {
  assertUUID('studentId', studentId)
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: allTournaments, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .or(`status.eq.upcoming,tournament_date.gte.${today}`)
    .order('tournament_date', { ascending: true })

  if (tErr) throw new Error(tErr.message)

  const tournamentIds = (allTournaments ?? []).map(t => t.id)
  let registeredSet = new Set<string>()

  if (tournamentIds.length > 0) {
    const { data: registrations } = await supabase
      .from('tournament_participants')
      .select('tournament_id')
      .eq('student_id', studentId)
      .in('tournament_id', tournamentIds)

    registeredSet = new Set((registrations ?? []).map(r => r.tournament_id))
  }

  const upcoming: TournamentWithRegistration[] = (allTournaments ?? []).map(t => ({
    ...(t as Tournament),
    isRegistered: registeredSet.has(t.id),
  }))

  const { data: pastParticipations, error: pErr } = await supabase
    .from('tournament_participants')
    .select('*, tournaments(*)')
    .eq('student_id', studentId)

  if (pErr) throw new Error(pErr.message)

  const past: PastTournament[] = (pastParticipations ?? [])
    .filter((p: Record<string, unknown>) => {
      const t = p.tournaments as Tournament | null
      return t && (t.status === 'completed' || (t.tournament_date && t.tournament_date < today))
    })
    .map((p: Record<string, unknown>) => {
      const t = p.tournaments as Tournament
      return {
        ...t,
        rank:               p.rank               as number | null,
        score:              p.score              as number | null,
        performance_rating: p.performance_rating as number | null,
        medal:              p.medal              as string | null,
        notes:              p.notes              as string | null,
      }
    })
    .sort((a, b) => b.tournament_date.localeCompare(a.tournament_date))

  return { upcoming, past }
}

export async function registerForTournament(tournamentId: string, studentId: string) {
  await enforceActionRateLimit()
  assertUUID('tournamentId', tournamentId)
  assertUUID('studentId', studentId)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('tournament_participants').insert({
    tournament_id: tournamentId,
    student_id:    studentId,
  })

  if (error) throw new Error(error.message)

  const [studentRes, tournamentRes] = await Promise.all([
    supabase.from('students').select('full_name').eq('id', studentId).single(),
    supabase.from('tournaments').select('name').eq('id', tournamentId).single(),
  ])

  const studentName    = studentRes.data?.full_name ?? 'A student'
  const tournamentName = tournamentRes.data?.name   ?? 'a tournament'

  try {
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        recipient_id: admin.id,
        message: `Student ${studentName} registered for ${tournamentName} — pending approval.`,
        is_read: false,
      }))
      await supabase.from('notifications').insert(notifications)
    }
  } catch {
    console.warn('Could not create admin notification (table may not exist)')
  }

  revalidatePath('/student/tournaments')
  revalidatePath('/admin/tournaments')
}

// ─── Detail view ──────────────────────────────────────────────────────────────

export interface TournamentDetail extends Tournament {
  participants: Array<{
    student_id:         string
    full_name:          string
    rank:               number | null
    score:              number | null
    performance_rating: number | null
    medal:              string | null
  }>
}

export async function getTournamentDetail(tournamentId: string): Promise<TournamentDetail | null> {
  assertUUID('tournamentId', tournamentId)
  const supabase = await createClient()

  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single()

  if (tErr || !tournament) return null

  const { data: participants } = await supabase
    .from('tournament_participants')
    .select('*, students(full_name)')
    .eq('tournament_id', tournamentId)
    .order('rank', { ascending: true, nullsFirst: false })

  return {
    ...(tournament as Tournament),
    participants: (participants ?? []).map((p: Record<string, unknown>) => ({
      student_id:         p.student_id         as string,
      full_name:          (p.students as Record<string, string> | null)?.full_name ?? 'Unknown',
      rank:               p.rank               as number | null,
      score:              p.score              as number | null,
      performance_rating: p.performance_rating as number | null,
      medal:              p.medal              as string | null,
    })),
  }
}
