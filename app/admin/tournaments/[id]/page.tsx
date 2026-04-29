import { createClient } from '@/lib/supabase/server'
import { Trophy, Calendar, MapPin, Users, Link as LinkIcon, Plus, Medal } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addTournamentParticipant, updateTournamentStatus } from '@/lib/actions/tournaments'

export default async function TournamentDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ action?: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const { action } = await searchParams

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*, tournament_participants(*, students(full_name))')
    .eq('id', id)
    .single()

  if (!tournament) notFound()

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name')

  const statusColors: Record<string, string> = {
    upcoming: 'bg-info/10 text-info',
    ongoing: 'bg-warning/10 text-warning',
    completed: 'bg-success/10 text-success',
  }

  const medalColors: Record<string, string> = {
    gold: 'text-yellow-500 bg-yellow-500/10',
    silver: 'text-gray-400 bg-gray-400/10',
    bronze: 'text-amber-600 bg-amber-600/10',
    none: 'text-foreground-muted bg-surface',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
            <span className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${statusColors[tournament.status] ?? ''}`}>
              {tournament.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-foreground-muted mt-2">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              {new Date(tournament.tournament_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {tournament.end_date && ` – ${new Date(tournament.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </div>
            {tournament.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                {tournament.location}
              </div>
            )}
            {tournament.registration_url && (
              <a href={tournament.registration_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:text-primary-hover">
                <LinkIcon size={16} />
                Registration Link
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {tournament.status === 'upcoming' && (
            <form action={async () => {
              'use server'
              await updateTournamentStatus(id, 'ongoing')
            }}>
              <button className="px-4 py-2.5 rounded-lg bg-warning/10 text-warning text-sm font-medium hover:bg-warning/20 transition-colors">
                Start Tournament
              </button>
            </form>
          )}
          {tournament.status === 'ongoing' && (
            <form action={async () => {
              'use server'
              await updateTournamentStatus(id, 'completed')
            }}>
              <button className="px-4 py-2.5 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors">
                Mark Completed
              </button>
            </form>
          )}
          <Link
            href={`/admin/tournaments/${id}?action=add_participant`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-all"
          >
            <Plus size={18} />
            Add Participant
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {action === 'add_participant' && (
            <div className="glass-card p-6 border-primary/20">
              <h2 className="text-lg font-semibold mb-4">Record Participant Result</h2>
              <form action={addTournamentParticipant} className="space-y-4">
                <input type="hidden" name="tournament_id" value={id} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-medium text-foreground-muted">Student</label>
                    <select name="student_id" required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="">Select Student...</option>
                      {students?.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground-muted">Final Rank</label>
                    <input type="number" name="rank" min="1" placeholder="e.g. 5" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground-muted">Total Score</label>
                    <input type="number" name="score" step="0.5" min="0" placeholder="e.g. 6.5" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground-muted">Performance Rating (Optional)</label>
                    <input type="number" name="performance_rating" placeholder="e.g. 1500" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground-muted">Medal / Award</label>
                    <select name="medal" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="none">None</option>
                      <option value="gold">Gold (1st)</option>
                      <option value="silver">Silver (2nd)</option>
                      <option value="bronze">Bronze (3rd)</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-medium text-foreground-muted">Notes / Key Games</label>
                    <textarea name="notes" rows={2} placeholder="Played well against..." className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Link href={`/admin/tournaments/${id}`} className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover">Cancel</Link>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors">Save Result</button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-border-subtle bg-surface/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users size={20} className="text-foreground-muted" />
                Participants & Results
              </h2>
              <span className="text-xs font-medium text-foreground-muted px-2 py-1 rounded bg-surface border border-border">
                {tournament.tournament_participants?.length ?? 0} Students
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle text-xs text-foreground-muted uppercase tracking-wider text-left">
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold text-center">Rank</th>
                    <th className="px-5 py-3 font-semibold text-center">Score</th>
                    <th className="px-5 py-3 font-semibold">Award</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {!tournament.tournament_participants || tournament.tournament_participants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <p className="text-foreground-muted font-medium">No participants recorded yet</p>
                      </td>
                    </tr>
                  ) : (
                    tournament.tournament_participants
                      .sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999))
                      .map((p: any) => (
                        <tr key={p.student_id} className="hover:bg-surface-hover/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <Link href={`/admin/students/${p.student_id}`} className="font-medium text-sm hover:text-primary transition-colors">
                              {p.students?.full_name}
                            </Link>
                            {p.notes && <p className="text-xs text-foreground-subtle mt-0.5">{p.notes}</p>}
                          </td>
                          <td className="px-5 py-3.5 text-center font-mono font-medium">
                            {p.rank ? `#${p.rank}` : '–'}
                          </td>
                          <td className="px-5 py-3.5 text-center font-mono">
                            {p.score ?? '–'}
                          </td>
                          <td className="px-5 py-3.5">
                            {p.medal !== 'none' ? (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full font-medium capitalize ${medalColors[p.medal]}`}>
                                <Medal size={12} />
                                {p.medal}
                              </span>
                            ) : '–'}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground-muted">Tournament Info</h3>
            <div className="space-y-4">
              {tournament.format && (
                <div>
                  <p className="text-xs text-foreground-subtle">Format</p>
                  <p className="text-sm font-medium mt-0.5">{tournament.format}</p>
                </div>
              )}
              {tournament.organizer && (
                <div>
                  <p className="text-xs text-foreground-subtle">Organizer</p>
                  <p className="text-sm font-medium mt-0.5">{tournament.organizer}</p>
                </div>
              )}
              {tournament.description && (
                <div>
                  <p className="text-xs text-foreground-subtle">Description</p>
                  <p className="text-sm mt-0.5 whitespace-pre-wrap">{tournament.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
