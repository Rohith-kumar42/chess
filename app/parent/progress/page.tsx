import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProgressForStudent } from '@/lib/actions/progress'
import ParentProgressClient from '@/components/progress/ParentProgressClient'
import type { Student } from '@/types/app.types'
import type { ProgressData } from '@/lib/actions/progress'

interface ChildProgressData {
  student: Student
  progressData: ProgressData
}

export default async function ParentProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Find children for this parent
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('parent_id', user.id)
    .order('full_name')

  if (!students || students.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Progress Tracking
        </h1>
        <div className="glass-card p-12 text-center">
          <p className="text-foreground-muted">No children linked to your account</p>
        </div>
      </div>
    )
  }

  // Fetch progress for all children
  const childrenProgress: ChildProgressData[] = await Promise.all(
    students.map(async (student) => ({
      student: student as Student,
      progressData: await getProgressForStudent(student.id),
    }))
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Progress Tracking
        </h1>
        <p className="text-foreground-muted mt-1">Monitor your child&apos;s chess journey</p>
      </div>

      <ParentProgressClient childrenProgress={childrenProgress} />
    </div>
  )
}

