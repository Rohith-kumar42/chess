import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, Video as VideoIcon, Clock } from 'lucide-react'

export default async function SchedulePage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, session_students(student_id)')
    .order('session_date', { ascending: true })

  const upcoming = sessions?.filter(s => s.session_date >= today) ?? []
  const past = sessions?.filter(s => s.session_date < today) ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-foreground-muted mt-1">{upcoming.length} upcoming · {past.length} past sessions</p>
        </div>
        <Link
          href="/admin/schedule/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-all"
        >
          <Plus size={18} />
          New Session
        </Link>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-info" /> Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Calendar size={40} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
            <p className="text-foreground-muted">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((session) => (
              <div key={session.id} className="glass-card p-5 hover:border-info/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{session.title}</h3>
                  <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded-full font-medium">
                    {session.session_students?.length ?? 0} students
                  </span>
                </div>
                <div className="space-y-1 text-sm text-foreground-muted">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    {session.start_time?.slice(0, 5)}{session.end_time ? ` – ${session.end_time.slice(0, 5)}` : ''}
                  </div>
                </div>
                {session.zoom_link && (
                  <a
                    href={session.zoom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs text-info hover:text-info font-medium"
                  >
                    <VideoIcon size={13} />
                    Join Zoom
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground-muted">Past Sessions</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase">Title</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase">Time</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-foreground-muted uppercase">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {past.slice(0, 20).map((session) => (
                    <tr key={session.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-5 py-3">{session.title}</td>
                      <td className="px-5 py-3 text-foreground-muted">
                        {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-foreground-muted font-mono">{session.start_time?.slice(0, 5)}</td>
                      <td className="px-5 py-3 text-center">{session.session_students?.length ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
