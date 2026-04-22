'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const studentIds = formData.getAll('student_ids') as string[]

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      title: formData.get('title') as string,
      session_date: formData.get('session_date') as string,
      start_time: formData.get('start_time') as string,
      end_time: (formData.get('end_time') as string) || null,
      zoom_link: (formData.get('zoom_link') as string) || null,
      zoom_password: (formData.get('zoom_password') as string) || null,
      description: (formData.get('description') as string) || null,
      is_recurring: formData.get('is_recurring') === 'true',
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Add students to session
  if (studentIds.length > 0 && session) {
    const junctions = studentIds.map(sid => ({
      session_id: session.id,
      student_id: sid,
    }))
    await supabase.from('session_students').insert(junctions)
  }

  revalidatePath('/admin/schedule')
}

export async function createRecording(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const studentIds = formData.getAll('student_ids') as string[]
  const isPublic = formData.get('is_public') === 'true'

  const { data: recording, error } = await supabase
    .from('recordings')
    .insert({
      title: formData.get('title') as string,
      recording_url: formData.get('recording_url') as string,
      recording_date: (formData.get('recording_date') as string) || null,
      duration_minutes: formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null,
      description: (formData.get('description') as string) || null,
      session_id: (formData.get('session_id') as string) || null,
      is_public: isPublic,
      uploaded_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Add student access if not public
  if (!isPublic && studentIds.length > 0 && recording) {
    const accessRecords = studentIds.map(sid => ({
      recording_id: recording.id,
      student_id: sid,
    }))
    await supabase.from('recording_access').insert(accessRecords)
  }

  revalidatePath('/admin/recordings')
}
