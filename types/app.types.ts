export type UserRole = 'admin' | 'student' | 'parent'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'competitive'

export type FeeStatus = 'paid' | 'partially_paid' | 'unpaid'

export type GameResult = 'win' | 'loss' | 'draw' | 'n/a'

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed'

export type Medal = 'gold' | 'silver' | 'bronze' | 'none'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  user_id: string | null
  full_name: string
  date_of_birth: string | null
  age: number | null
  skill_level: SkillLevel | null
  chess_rating: number | null
  parent_id: string | null
  parent_name: string | null
  parent_phone: string | null
  parent_email: string | null
  school: string | null
  notes: string | null
  is_active: boolean
  enrolled_date: string
  created_at: string
  updated_at: string
}

export interface Fee {
  id: string
  student_id: string
  month: string
  amount_due: number
  amount_paid: number
  balance: number
  status: FeeStatus
  due_date: string | null
  paid_date: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  title: string
  session_date: string
  start_time: string
  end_time: string | null
  zoom_link: string | null
  zoom_password: string | null
  description: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  created_by: string | null
  created_at: string
}

export interface ProgressEntry {
  id: string
  student_id: string
  entry_date: string
  skill_level: string | null
  rating_before: number | null
  rating_after: number | null
  game_result: GameResult | null
  openings_studied: string[] | null
  tactics_topics: string[] | null
  coach_remarks: string
  areas_to_improve: string | null
  homework: string | null
  coach_id: string | null
  session_id: string | null
  created_at: string
}

export interface Recording {
  id: string
  session_id: string | null
  title: string
  recording_url: string
  recording_date: string | null
  duration_minutes: number | null
  description: string | null
  is_public: boolean
  uploaded_by: string | null
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  organizer: string | null
  location: string | null
  tournament_date: string
  end_date: string | null
  format: string | null
  registration_url: string | null
  description: string | null
  status: TournamentStatus
  created_at: string
}

export interface TournamentParticipant {
  tournament_id: string
  student_id: string
  rank: number | null
  score: number | null
  performance_rating: number | null
  medal: Medal | null
  notes: string | null
}

// Extended types with joins
export interface StudentWithFees extends Student {
  fees: Pick<Fee, 'status' | 'balance'>[]
}

export interface FeeWithStudent extends Fee {
  students: Pick<Student, 'full_name'>
}

export interface TournamentWithParticipants extends Tournament {
  tournament_participants: (TournamentParticipant & {
    students: Pick<Student, 'full_name'>
  })[]
}

export interface DashboardStats {
  totalStudents: number | null
  totalOutstanding: number
  upcomingSessions: Session[]
}

export interface Notification {
  id: string
  recipient_id: string
  message: string
  is_read: boolean
  created_at: string
}
