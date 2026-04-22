'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTournament(formData: FormData) {
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
  const supabase = await createClient()

  const { error } = await supabase
    .from('tournaments')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tournaments')
}
