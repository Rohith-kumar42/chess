'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { enforceActionRateLimit } from '@/lib/actions/rate-limit-guard'

export async function createTournament(formData: FormData) {
  await enforceActionRateLimit()
  const supabase = await createClient()

  const { error } = await supabase.from('tournaments').insert({
    name: formData.get('name') as string,
    organizer: (formData.get('organizer') as string) || null,
    location: (formData.get('location') as string) || null,
    tournament_date: formData.get('tournament_date') as string,
    end_date: (formData.get('end_date') as string) || null,
    format: (formData.get('format') as string) || null,
    registration_url: (formData.get('registration_url') as string) || null,
    description: (formData.get('description') as string) || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tournaments')
}

export async function addTournamentParticipant(formData: FormData) {
  await enforceActionRateLimit()
  const supabase = await createClient()

  const { error } = await supabase.from('tournament_participants').insert({
    tournament_id: formData.get('tournament_id') as string,
    student_id: formData.get('student_id') as string,
    rank: formData.get('rank') ? Number(formData.get('rank')) : null,
    score: formData.get('score') ? Number(formData.get('score')) : null,
    performance_rating: formData.get('performance_rating') ? Number(formData.get('performance_rating')) : null,
    medal: (formData.get('medal') as string) || 'none',
    notes: (formData.get('notes') as string) || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tournaments')
}

export async function updateTournamentStatus(id: string, status: string) {
  await enforceActionRateLimit()
  const supabase = await createClient()

  const { error } = await supabase
    .from('tournaments')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tournaments')
}

import type { Tournament, TournamentParticipant, Student } from '@/types/app.types'

export interface TournamentWithRegistration extends Tournament {
  isRegistered: boolean
}

export interface PastTournament extends Tournament {
  rank: number | null
  score: number | null
  performance_rating: number | null
  medal: string | null
  notes: string | null
}

export interface StudentTournamentData {
  upcoming: TournamentWithRegistration[]
  past: PastTournament[]
}

export async function getTournamentsForStudent(studentId: string): Promise<StudentTournamentData> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // 1) Upcoming tournaments
  const { data: allTournaments, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .or(`status.eq.upcoming,tournament_date.gte.${today}`)
    .order('tournament_date', { ascending: true })

  if (tErr) throw new Error(tErr.message)

  // 2) Check which ones this student is registered for
  const tournamentIds = (allTournaments ?? []).map((t) => t.id)
  let registeredSet = new Set<string>()

  if (tournamentIds.length > 0) {
    const { data: registrations } = await supabase
      .from('tournament_participants')
      .select('tournament_id')
      .eq('student_id', studentId)
      .in('tournament_id', tournamentIds)

    registeredSet = new Set((registrations ?? []).map((r) => r.tournament_id))
  }

  const upcoming: TournamentWithRegistration[] = (allTournaments ?? []).map((t) => ({
    ...(t as Tournament),
    isRegistered: registeredSet.has(t.id),
  }))

  // 3) Past tournaments this student participated in
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
        rank: p.rank as number | null,
        score: p.score as number | null,
        performance_rating: p.performance_rating as number | null,
        medal: p.medal as string | null,
        notes: p.notes as string | null,
      }
    })
    .sort((a, b) => b.tournament_date.localeCompare(a.tournament_date))

  return { upcoming, past }
}

export async function registerForTournament(tournamentId: string, studentId: string) {
  await enforceActionRateLimit()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Insert into tournament_participants (same table as admin)
  const { error } = await supabase.from('tournament_participants').insert({
    tournament_id: tournamentId,
    student_id: studentId,
  })

  if (error) throw new Error(error.message)

  // Fetch student name and tournament name for the notification
  const [studentRes, tournamentRes] = await Promise.all([
    supabase.from('students').select('full_name').eq('id', studentId).single(),
    supabase.from('tournaments').select('name').eq('id', tournamentId).single(),
  ])

  const studentName = studentRes.data?.full_name ?? 'A student'
  const tournamentName = tournamentRes.data?.name ?? 'a tournament'

  // Notify all admins (if notifications table exists)
  try {
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      const notifications = admins.map((admin) => ({
        recipient_id: admin.id,
        message: `Student ${studentName} registered for ${tournamentName} — pending approval.`,
        is_read: false,
      }))

      await supabase.from('notifications').insert(notifications)
    }
  } catch {
    // notifications table might not exist yet — don't block registration
    console.warn('Could not create admin notification (table may not exist)')
  }

  revalidatePath('/student/tournaments')
  revalidatePath('/admin/tournaments')
}

export interface TournamentDetail extends Tournament {
  participants: Array<{
    student_id: string
    full_name: string
    rank: number | null
    score: number | null
    performance_rating: number | null
    medal: string | null
  }>
}

export async function getTournamentDetail(tournamentId: string): Promise<TournamentDetail | null> {
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
      student_id: p.student_id as string,
      full_name: (p.students as Record<string, string> | null)?.full_name ?? 'Unknown',
      rank: p.rank as number | null,
      score: p.score as number | null,
      performance_rating: p.performance_rating as number | null,
      medal: p.medal as string | null,
    })),
  }
}
