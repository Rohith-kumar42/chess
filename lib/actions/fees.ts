'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFee(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('fees').insert({
    student_id: formData.get('student_id') as string,
    month: formData.get('month') as string,
    amount_due: Number(formData.get('amount_due')),
    due_date: (formData.get('due_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/fees')
}

export async function recordPayment(feeId: string, formData: FormData) {
  const supabase = await createClient()

  const amount = Number(formData.get('amount'))
  const paymentMethod = (formData.get('payment_method') as string) || null

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
      amount_paid: newAmountPaid,
      payment_method: paymentMethod,
      paid_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', feeId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/fees')
}

export async function bulkGenerateFees(formData: FormData) {
  const supabase = await createClient()
  const month = formData.get('month') as string
  const amountDue = Number(formData.get('amount_due'))
  const dueDate = (formData.get('due_date') as string) || null

  // Get all active students
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('is_active', true)

  if (!students || students.length === 0) throw new Error('No active students found')

  const feeRecords = students.map(s => ({
    student_id: s.id,
    month,
    amount_due: amountDue,
    due_date: dueDate,
  }))

  const { error } = await supabase.from('fees').insert(feeRecords)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/fees')
}
