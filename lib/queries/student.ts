
import { createClient } from '@/lib/supabase/server'
import { Session, Recording, ProgressEntry, Fee } from '@/types/app.types'

export async function getStudentDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get student record for this user
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!student) return null

  const today = new Date().toISOString().split('T')[0]

  const [sessionsRes, recordingsRes, progressRes, feesRes] = await Promise.all([
    // Upcoming sessions for this student
    supabase
      .from('sessions')
      .select('*, session_students!inner(student_id)')
      .eq('session_students.student_id', student.id)
      .gte('session_date', today)
      .order('session_date', { ascending: true })
      .limit(3),

    // Accessible recordings (public or assigned)
    supabase
      .from('recordings')
      .select('*, recording_access!left(student_id)')
      .or(`is_public.eq.true,recording_access.student_id.eq.${student.id}`)
      .order('created_at', { ascending: false })
      .limit(4),

    // Recent progress entries
    supabase
      .from('progress_entries')
      .select('*')
      .eq('student_id', student.id)
      .order('entry_date', { ascending: false })
      .limit(3),
    
    // Recent fees
    supabase
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('month', { ascending: false })
      .limit(3)
  ])

  return {
    studentId: student.id,
    upcomingSessions: sessionsRes.data || [],
    recentRecordings: recordingsRes.data || [],
    recentProgress: progressRes.data || [],
    recentFees: feesRes.data || []
  }
}
