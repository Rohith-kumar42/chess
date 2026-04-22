import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, Trophy, TrendingUp, GraduationCap, Phone, Mail } from 'lucide-react'
import { calculateAge } from '@/lib/utils'

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) notFound()

  const { data: progressEntries } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('student_id', id)
    .order('entry_date', { ascending: false })
    .limit(5)

  const { data: fees } = await supabase
    .from('fees')
    .select('*')
    .eq('student_id', id)
    .order('month', { ascending: false })
    .limit(6)

  const { data: tournaments } = await supabase
    .from('tournament_participants')
    .select('*, tournaments(*)')
    .eq('student_id', id)
    .order('tournaments(tournament_date)', { ascending: false })

  const skillLevelColors: Record<string, string> = {
    beginner: 'bg-info/10 text-info border-info/20',
    intermediate: 'bg-warning/10 text-warning border-warning/20',
    advanced: 'bg-accent/10 text-accent border-accent/20',
    competitive: 'bg-primary/10 text-primary border-primary/20',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{student.full_name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {student.skill_level && (
                <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium capitalize border ${skillLevelColors[student.skill_level] ?? ''}`}>
                  {student.skill_level}
                </span>
              )}
              <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                student.is_active ? 'bg-success/10 text-success' : 'bg-foreground-subtle/10 text-foreground-subtle'
              }`}>
                {student.is_active ? 'Active' : 'Archived'}
              </span>
            </div>
          </div>
        </div>
        <Link
          href={`/admin/students/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover transition-colors"
        >
          <Edit size={16} />
          Edit
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <GraduationCap size={14} /> Student Details
          </h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-foreground-subtle">Age:</span> <span className="font-medium">{calculateAge(student.date_of_birth) ?? '–'}</span></div>
            <div><span className="text-foreground-subtle">Rating:</span> <span className="font-medium font-mono">{student.chess_rating ?? '–'}</span></div>
            <div><span className="text-foreground-subtle">School:</span> <span className="font-medium">{student.school ?? '–'}</span></div>
            <div><span className="text-foreground-subtle">Enrolled:</span> <span className="font-medium">{new Date(student.enrolled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Phone size={14} /> Parent / Guardian
          </h3>
          <div className="space-y-2 text-sm">
            <div className="font-medium">{student.parent_name || '–'}</div>
            {student.parent_email && (
              <div className="flex items-center gap-1.5 text-foreground-muted">
                <Mail size={13} /> {student.parent_email}
              </div>
            )}
            {student.parent_phone && (
              <div className="flex items-center gap-1.5 text-foreground-muted">
                <Phone size={13} /> {student.parent_phone}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Trophy size={14} /> Achievements
          </h3>
          <div className="space-y-2 text-sm">
            {!tournaments || tournaments.length === 0 ? (
              <p className="text-foreground-subtle">No tournament entries yet</p>
            ) : (
              tournaments.slice(0, 3).map((tp: any) => (
                <div key={tp.tournament_id} className="flex items-center gap-2">
                  {tp.medal && tp.medal !== 'none' && (
                    <span>{tp.medal === 'gold' ? '🥇' : tp.medal === 'silver' ? '🥈' : '🥉'}</span>
                  )}
                  <span className="truncate">{tp.tournaments?.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {student.notes && (
        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-sm text-foreground-muted whitespace-pre-wrap">{student.notes}</p>
        </div>
      )}

      {/* Recent Progress */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" /> Recent Progress
          </h3>
          <Link href={`/admin/progress/${id}`} className="text-xs text-primary hover:text-primary-hover font-medium">
            View All →
          </Link>
        </div>
        {!progressEntries || progressEntries.length === 0 ? (
          <p className="text-sm text-foreground-subtle py-4 text-center">No progress entries yet</p>
        ) : (
          <div className="space-y-3">
            {progressEntries.map((entry) => (
              <div key={entry.id} className="p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground-muted">
                    {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {entry.game_result && (
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      entry.game_result === 'win' ? 'bg-success/10 text-success' :
                      entry.game_result === 'loss' ? 'bg-danger/10 text-danger' :
                      entry.game_result === 'draw' ? 'bg-warning/10 text-warning' :
                      'bg-surface text-foreground-muted'
                    }`}>
                      {entry.game_result}
                    </span>
                  )}
                </div>
                <p className="text-sm">{entry.coach_remarks}</p>
                {entry.areas_to_improve && (
                  <p className="text-xs text-foreground-subtle mt-1">Improve: {entry.areas_to_improve}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Fees */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            💰 Fee History
          </h3>
          <Link href={`/admin/fees/${id}`} className="text-xs text-primary hover:text-primary-hover font-medium">
            View All →
          </Link>
        </div>
        {!fees || fees.length === 0 ? (
          <p className="text-sm text-foreground-subtle py-4 text-center">No fee records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 text-xs text-foreground-muted uppercase">Month</th>
                  <th className="text-right py-2 text-xs text-foreground-muted uppercase">Due</th>
                  <th className="text-right py-2 text-xs text-foreground-muted uppercase">Paid</th>
                  <th className="text-right py-2 text-xs text-foreground-muted uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {fees.map((fee) => (
                  <tr key={fee.id}>
                    <td className="py-2">{new Date(fee.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                    <td className="py-2 text-right font-mono">₹{Number(fee.amount_due).toLocaleString()}</td>
                    <td className="py-2 text-right font-mono">₹{Number(fee.amount_paid).toLocaleString()}</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        fee.status === 'paid' ? 'bg-success/10 text-success' :
                        fee.status === 'partially_paid' ? 'bg-warning/10 text-warning' :
                        'bg-danger/10 text-danger'
                      }`}>
                        {fee.status === 'partially_paid' ? 'Partial' : fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
