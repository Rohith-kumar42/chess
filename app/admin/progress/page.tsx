import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TrendingUp, Plus } from 'lucide-react'
import { createProgressEntry } from '@/lib/actions/progress'

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const supabase = await createClient()
  const { action } = await searchParams

  const { data: entries } = await supabase
    .from('progress_entries')
    .select('*, students(full_name)')
    .order('entry_date', { ascending: false })
    .limit(50)

  const showAddForm = action === 'add'
  
  const { data: activeStudents } = showAddForm ? await supabase
    .from('students')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name') : { data: null }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
          <p className="text-foreground-muted mt-1">Track student growth and coach remarks</p>
        </div>
        <Link
          href="/admin/progress?action=add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-all"
        >
          <Plus size={18} />
          Add Entry
        </Link>
      </div>

      {showAddForm && (
        <div className="glass-card p-6 border-primary/20">
          <h2 className="text-lg font-semibold mb-4">Add Progress Entry</h2>
          <form action={createProgressEntry} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Student</label>
                <select name="student_id" required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select Student...</option>
                  {activeStudents?.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Date</label>
                <input type="date" name="entry_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Game Result</label>
                <select name="game_result" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">N/A</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="draw">Draw</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Skill Level</label>
                <select name="skill_level" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">(No change)</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="competitive">Competitive</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-foreground-muted">Coach Remarks</label>
                <textarea name="coach_remarks" required rows={3} placeholder="Notes about today's session..." className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Areas to Improve</label>
                <input type="text" name="areas_to_improve" placeholder="e.g. Endgames, Tactics" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Homework</label>
                <input type="text" name="homework" placeholder="e.g. Solve 10 mates in 1" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Link href="/admin/progress" className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover">Cancel</Link>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors">Save Entry</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {!entries || entries.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <TrendingUp size={48} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
            <p className="text-foreground-muted font-medium">No progress entries yet</p>
            <p className="text-sm text-foreground-subtle mt-1">Add notes after each coaching session</p>
          </div>
        ) : (
          entries.map((entry: any) => (
            <div key={entry.id} className="glass-card p-5 hover:border-primary/20 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div>
                  <Link href={`/admin/students/${entry.student_id}`} className="font-medium hover:text-primary transition-colors">
                    {entry.students?.full_name}
                  </Link>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.skill_level && (
                    <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-primary/10 text-primary capitalize">
                      {entry.skill_level}
                    </span>
                  )}
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
              </div>
              <p className="text-sm text-foreground-muted">{entry.coach_remarks}</p>
              {entry.areas_to_improve && (
                <p className="text-xs text-foreground-subtle mt-2">📌 Improve: {entry.areas_to_improve}</p>
              )}
              {entry.homework && (
                <p className="text-xs text-foreground-subtle mt-1">📝 Homework: {entry.homework}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
