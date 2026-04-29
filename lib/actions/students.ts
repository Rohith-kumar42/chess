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
  assertEmail,
  assertPhone,
  assertEnum,
  MAX_MEDIUM_TEXT,
} from '@/lib/validation'

// ─── Allowed enum values ──────────────────────────────────────────────────────
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const

export async function createStudent(formData: FormData) {
  await enforceActionRateLimit()
  assertPayloadSize(formData)

  const fullName   = requireText(formData, 'full_name')
  const dob        = optionalText(formData, 'date_of_birth')
  const rawLevel   = optionalText(formData, 'skill_level')
  const skillLevel = rawLevel ? assertEnum('skill_level', rawLevel, SKILL_LEVELS) : null
  const chessRating = optionalNumber(formData, 'chess_rating', { min: 0, max: 4000 })
  const parentName  = optionalText(formData, 'parent_name')
  const parentEmail = optionalText(formData, 'parent_email')
  const parentPhone = optionalText(formData, 'parent_phone')
  const school      = optionalText(formData, 'school')
  const notes       = optionalText(formData, 'notes', MAX_MEDIUM_TEXT)

  if (parentEmail) assertEmail('parent_email', parentEmail)
  if (parentPhone) assertPhone('parent_phone', parentPhone)

  const supabase = await createClient()
  const { error } = await supabase.from('students').insert({
    full_name:    fullName,
    date_of_birth: dob,
    skill_level:  skillLevel,
    chess_rating: chessRating,
    parent_name:  parentName,
    parent_email: parentEmail,
    parent_phone: parentPhone,
    school,
    notes,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/students')
}

export async function updateStudent(id: string, formData: FormData) {
  await enforceActionRateLimit()
  assertUUID('id', id)
  assertPayloadSize(formData)

  const fullName    = requireText(formData, 'full_name')
  const dob         = optionalText(formData, 'date_of_birth')
  const rawLevel    = optionalText(formData, 'skill_level')
  const skillLevel  = rawLevel ? assertEnum('skill_level', rawLevel, SKILL_LEVELS) : null
  const chessRating = optionalNumber(formData, 'chess_rating', { min: 0, max: 4000 })
  const parentName  = optionalText(formData, 'parent_name')
  const parentEmail = optionalText(formData, 'parent_email')
  const parentPhone = optionalText(formData, 'parent_phone')
  const school      = optionalText(formData, 'school')
  const notes       = optionalText(formData, 'notes', MAX_MEDIUM_TEXT)

  if (parentEmail) assertEmail('parent_email', parentEmail)
  if (parentPhone) assertPhone('parent_phone', parentPhone)

  const supabase = await createClient()
  const { error } = await supabase
    .from('students')
    .update({
      full_name:    fullName,
      date_of_birth: dob,
      skill_level:  skillLevel,
      chess_rating: chessRating,
      parent_name:  parentName,
      parent_email: parentEmail,
      parent_phone: parentPhone,
      school,
      notes,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${id}`)
}

export async function toggleStudentActive(id: string, isActive: boolean) {
  await enforceActionRateLimit()
  assertUUID('id', id)

  if (typeof isActive !== 'boolean') {
    throw new Error('"isActive" must be a boolean.')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('students')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${id}`)
}
