import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Plus, MapPin, Calendar } from 'lucide-react'

export default async function TournamentsPage() {
  const supabase = await createClient()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, tournament_participants(student_id)')
    .order('tournament_date', { ascending: false })

  const statusColors: Record<string, string> = {
    upcoming: 'bg-info/10 text-info',
    ongoing: 'bg-warning/10 text-warning',
    completed: 'bg-success/10 text-success',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
          <p className="text-foreground-muted mt-1">{tournaments?.length ?? 0} tournaments</p>
        </div>
        <Link
          href="/admin/tournaments/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-all"
        >
          <Plus size={18} />
          Add Tournament
        </Link>
      </div>

      {!tournaments || tournaments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Trophy size={48} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
          <p className="text-foreground-muted font-medium">No tournaments yet</p>
          <p className="text-sm text-foreground-subtle mt-1">Track tournament participation and results</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t: any) => (
            <Link key={t.id} href={`/admin/tournaments/${t.id}`}>
              <div className="glass-card p-5 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{t.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium capitalize ${statusColors[t.status] ?? ''}`}>
                    {t.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-foreground-muted">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(t.tournament_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {t.end_date && ` – ${new Date(t.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </div>
                  {t.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {t.location}
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-foreground-subtle">
                  {t.tournament_participants?.length ?? 0} participants
                  {t.format && ` · ${t.format}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
