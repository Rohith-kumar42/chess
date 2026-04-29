'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { enforceActionRateLimit } from '@/lib/actions/rate-limit-guard'

export async function createStudent(formData: FormData) {
  await enforceActionRateLimit()
  const supabase = await createClient()

  const { error } = await supabase.from('students').insert({
    full_name: formData.get('full_name') as string,
    date_of_birth: (formData.get('date_of_birth') as string) || null,
    skill_level: (formData.get('skill_level') as string) || null,
    chess_rating: formData.get('chess_rating') ? Number(formData.get('chess_rating')) : null,
    parent_name: (formData.get('parent_name') as string) || null,
    parent_email: (formData.get('parent_email') as string) || null,
    parent_phone: (formData.get('parent_phone') as string) || null,
    school: (formData.get('school') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/students')
}

export async function updateStudent(id: string, formData: FormData) {
  await enforceActionRateLimit()
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .update({
      full_name: formData.get('full_name') as string,
      date_of_birth: (formData.get('date_of_birth') as string) || null,
      skill_level: (formData.get('skill_level') as string) || null,
      chess_rating: formData.get('chess_rating') ? Number(formData.get('chess_rating')) : null,
      parent_name: (formData.get('parent_name') as string) || null,
      parent_email: (formData.get('parent_email') as string) || null,
      parent_phone: (formData.get('parent_phone') as string) || null,
      school: (formData.get('school') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${id}`)
}

export async function toggleStudentActive(id: string, isActive: boolean) {
  await enforceActionRateLimit()
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${id}`)
}
