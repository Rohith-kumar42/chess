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
  requireUUIDArray,
  MAX_MEDIUM_TEXT,
  MAX_SHORT_TEXT,
} from '@/lib/validation'

// Time format HH:MM or HH:MM:SS
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

function assertTime(field: string, value: string): void {
  if (!TIME_RE.test(value)) {
    throw new Error(`"${field}" must be a valid time (HH:MM).`)
  }
}

export async function createSession(formData: FormData) {
  await enforceActionRateLimit()
  assertPayloadSize(formData)

  const title       = requireText(formData, 'title')
  const sessionDate = requireText(formData, 'session_date')
  assertDate('session_date', sessionDate)

  const startTime = requireText(formData, 'start_time')
  assertTime('start_time', startTime)

  const endTime = optionalText(formData, 'end_time')
  if (endTime) assertTime('end_time', endTime)

  const rawZoomLink = optionalText(formData, 'zoom_link')
  if (rawZoomLink) assertURL('zoom_link', rawZoomLink)

  const zoomPassword  = optionalText(formData, 'zoom_password')
  const description   = optionalText(formData, 'description', MAX_MEDIUM_TEXT)
  const isRecurring   = formData.get('is_recurring') === 'true'

  // Validate student IDs array
  const rawStudentIds = (formData.getAll('student_ids') as string[]).filter(Boolean)
  const studentIds    = rawStudentIds.length > 0
    ? requireUUIDArray('student_ids', rawStudentIds)
    : []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      title,
      session_date:  sessionDate,
      start_time:    startTime,
      end_time:      endTime,
      zoom_link:     rawZoomLink,
      zoom_password: zoomPassword,
      description,
      is_recurring:  isRecurring,
      created_by:    user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

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
  await enforceActionRateLimit()
  assertPayloadSize(formData)

  const title        = requireText(formData, 'title')
  const recordingUrl = requireText(formData, 'recording_url', MAX_SHORT_TEXT)
  assertURL('recording_url', recordingUrl)

  const recordingDate     = optionalText(formData, 'recording_date')
  if (recordingDate) assertDate('recording_date', recordingDate)

  const durationMinutes   = optionalNumber(formData, 'duration_minutes', { min: 1, max: 600 })
  const description       = optionalText(formData, 'description', MAX_MEDIUM_TEXT)
  const rawSessionId      = optionalText(formData, 'session_id')
  if (rawSessionId) assertUUID('session_id', rawSessionId)

  const isPublic = formData.get('is_public') === 'true'

  const rawStudentIds = (formData.getAll('student_ids') as string[]).filter(Boolean)
  const studentIds    = rawStudentIds.length > 0
    ? requireUUIDArray('student_ids', rawStudentIds)
    : []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recording, error } = await supabase
    .from('recordings')
    .insert({
      title,
      recording_url:    recordingUrl,
      recording_date:   recordingDate,
      duration_minutes: durationMinutes,
      description,
      session_id:       rawSessionId,
      is_public:        isPublic,
      uploaded_by:      user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (!isPublic && studentIds.length > 0 && recording) {
    const accessRecords = studentIds.map(sid => ({
      recording_id: recording.id,
      student_id:   sid,
    }))
    await supabase.from('recording_access').insert(accessRecords)
  }

  revalidatePath('/admin/recordings')
}
