import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProgressForStudent } from '@/lib/actions/progress'
import StudentProgressClient from '@/components/progress/StudentProgressClient'

export default async function StudentProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Find the student record for this user
  const { data: student } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  if (!student) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          My Progress
        </h1>
        <div className="glass-card p-12 text-center">
          <p className="text-foreground-muted">No student profile linked to your account</p>
        </div>
      </div>
    )
  }

  const progressData = await getProgressForStudent(student.id)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          My Progress
        </h1>
        <p className="text-foreground-muted mt-1">Track your chess journey</p>
      </div>

      <StudentProgressClient progressData={progressData} />
    </div>
  )
}

