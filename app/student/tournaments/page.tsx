import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTournamentsForStudent } from '@/lib/actions/tournaments'
import StudentTournamentsClient from '@/components/tournaments/StudentTournamentsClient'

export default async function StudentTournamentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Find the student record for this user
  const { data: student } = await supabase
    .from('students')
    .select('id, full_name, chess_rating')
    .eq('user_id', user.id)
    .single()

  if (!student) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Tournaments
        </h1>
        <div className="glass-card p-12 text-center">
          <p className="text-foreground-muted">No student profile linked to your account</p>
        </div>
      </div>
    )
  }

  const tournamentData = await getTournamentsForStudent(student.id)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Tournaments
        </h1>
        <p className="text-foreground-muted mt-1">Register for upcoming events and view your history</p>
      </div>

      <StudentTournamentsClient
        tournamentData={tournamentData}
        studentId={student.id}
        studentRating={student.chess_rating}
      />
    </div>
  )
}

