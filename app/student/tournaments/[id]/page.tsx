import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getTournamentDetail } from '@/lib/actions/tournaments'
import TournamentDetailClient from '@/components/tournaments/TournamentDetailClient'

interface TournamentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get the student id for the current user
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const tournament = await getTournamentDetail(id)

  if (!tournament) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <TournamentDetailClient
        tournament={tournament}
        currentStudentId={student?.id ?? null}
      />
    </div>
  )
}

