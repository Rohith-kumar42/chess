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
  requireNumber,
  assertEnum,
  assertDate,
  MAX_MEDIUM_TEXT,
} from '@/lib/validation'
import type { Student, Fee } from '@/types/app.types'

// ─── Allowed enum values ──────────────────────────────────────────────────────
const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other'] as const

export async function createFee(formData: FormData) {
  await enforceActionRateLimit()
  assertPayloadSize(formData)

  const studentId = requireText(formData, 'student_id')
  assertUUID('student_id', studentId)

  const month = requireText(formData, 'month')
  // month must be YYYY-MM format
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error('"month" must be in YYYY-MM format.')
  }

  const amountDue = requireNumber(formData, 'amount_due', { min: 0, max: 1_000_000 })
  const dueDate   = optionalText(formData, 'due_date')
  if (dueDate) assertDate('due_date', dueDate)
  const notes = optionalText(formData, 'notes', MAX_MEDIUM_TEXT)

  const supabase = await createClient()
  const { error } = await supabase.from('fees').insert({
    student_id: studentId,
    month,
    amount_due: amountDue,
    due_date:   dueDate,
    notes,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/fees')
}

export async function recordPayment(feeId: string, formData: FormData) {
  await enforceActionRateLimit()
  assertUUID('feeId', feeId)
  assertPayloadSize(formData)

  const amount = requireNumber(formData, 'amount', { min: 0.01, max: 1_000_000 })
  const rawMethod   = optionalText(formData, 'payment_method')
  const paymentMethod = rawMethod
    ? assertEnum('payment_method', rawMethod, PAYMENT_METHODS)
    : null

  const supabase = await createClient()

  // Get current fee
  const { data: fee } = await supabase
    .from('fees')
    .select('amount_paid')
    .eq('id', feeId)
    .single()

  if (!fee) throw new Error('Fee record not found')

  const newAmountPaid = Number(fee.amount_paid) + amount

  const { error } = await supabase
    .from('fees')
    .update({
      amount_paid:    newAmountPaid,
      payment_method: paymentMethod,
      paid_date:      new Date().toISOString().split('T')[0],
    })
    .eq('id', feeId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/fees')
}

export async function bulkGenerateFees(formData: FormData) {
  await enforceActionRateLimit()
  assertPayloadSize(formData)

  const month = requireText(formData, 'month')
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error('"month" must be in YYYY-MM format.')
  }

  const amountDue = requireNumber(formData, 'amount_due', { min: 0, max: 1_000_000 })
  const dueDate   = optionalText(formData, 'due_date')
  if (dueDate) assertDate('due_date', dueDate)

  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('is_active', true)

  if (!students || students.length === 0) throw new Error('No active students found')

  const feeRecords = students.map(s => ({
    student_id: s.id,
    month,
    amount_due: amountDue,
    due_date:   dueDate,
  }))

  const { error } = await supabase.from('fees').insert(feeRecords)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/fees')
}

export interface StudentFeeGroup {
  student: Student
  fees: Fee[]
}

export async function getFeesForParent(parentId: string): Promise<StudentFeeGroup[]> {
  assertUUID('parentId', parentId)
  const supabase = await createClient()

  const { data: students, error: studentsErr } = await supabase
    .from('students')
    .select('*')
    .eq('parent_id', parentId)
    .order('full_name')

  if (studentsErr) throw new Error(studentsErr.message)
  if (!students || students.length === 0) return []

  const studentIds = students.map(s => s.id)

  const { data: fees, error: feesErr } = await supabase
    .from('fees')
    .select('*')
    .in('student_id', studentIds)
    .order('month', { ascending: false })

  if (feesErr) throw new Error(feesErr.message)

  return students.map(student => ({
    student: student as Student,
    fees: (fees ?? []).filter(f => f.student_id === student.id) as Fee[],
  }))
}
