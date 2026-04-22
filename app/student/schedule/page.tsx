import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, Video, MapPin } from 'lucide-react'

export default async function StudentSchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get student ID
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Get sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, session_students!inner(student_id)')
    .eq('session_students.student_id', student?.id)
    .order('session_date', { ascending: true })

  const today = new Date().toISOString().split('T')[0]
  const upcoming = sessions?.filter(s => s.session_date >= today) || []
  const past = sessions?.filter(s => s.session_date < today) || []

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Schedule</h1>
        <p className="text-foreground-muted mt-1">Manage your upcoming classes and review past sessions.</p>
      </div>

      {/* Upcoming Sessions */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-primary" />
          Upcoming Classes
        </h2>
        {upcoming.length === 0 ? (
          <div className="glass-card p-12 text-center bg-surface/30">
            <Calendar size={48} className="mx-auto text-foreground-subtle mb-4 opacity-30" />
            <p className="text-foreground-muted">No upcoming classes scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcoming.map((session) => (
              <div key={session.id} className="glass-card p-6 border-l-4 border-l-primary hover:bg-surface-hover/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{session.title}</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary">Confirmed</span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-foreground-muted">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground-subtle">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-xs">Date</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-foreground-muted">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground-subtle">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {session.start_time?.slice(0, 5)} {session.end_time ? ` – ${session.end_time.slice(0, 5)}` : ''}
                      </p>
                      <p className="text-xs">Time</p>
                    </div>
                  </div>
                </div>

                {session.zoom_link ? (
                  <a 
                    href={session.zoom_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                  >
                    <Video size={18} />
                    Join Online Class
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-surface border border-border text-foreground-muted text-sm font-medium">
                    <MapPin size={18} />
                    In-Person Session
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Sessions */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground-muted">Past Sessions</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface/30">
                    <th className="text-left px-5 py-3 text-xs font-bold text-foreground-subtle uppercase tracking-wider">Session</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-foreground-subtle uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-foreground-subtle uppercase tracking-wider">Time</th>
                    <th className="text-center px-5 py-3 text-xs font-bold text-foreground-subtle uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {past.map((session) => (
                    <tr key={session.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-5 py-4 font-medium">{session.title}</td>
                      <td className="px-5 py-4 text-foreground-muted">
                        {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-foreground-muted font-mono">{session.start_time?.slice(0, 5)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface border border-border text-foreground-subtle">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
