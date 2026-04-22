'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProgressEntry(formData: FormData) {
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
