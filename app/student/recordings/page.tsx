import { createClient } from '@/lib/supabase/server'
import { Video, ExternalLink, Calendar as CalendarIcon } from 'lucide-react'

export default async function StudentRecordingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get student ID
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Get recordings
  const { data: recordings } = await supabase
    .from('recordings')
    .select('*, recording_access!left(student_id)')
    .or(`is_public.eq.true,recording_access.student_id.eq.${student?.id}`)
    .order('recording_date', { ascending: false })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recordings</h1>
        <p className="text-foreground-muted mt-1">Review your past lessons and training sessions.</p>
      </div>

      {!recordings || recordings.length === 0 ? (
        <div className="glass-card p-12 text-center bg-surface/30">
          <Video size={48} className="mx-auto text-foreground-subtle mb-4 opacity-30" />
          <p className="text-foreground-muted">No recordings available for you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((rec) => (
            <div key={rec.id} className="glass-card overflow-hidden group hover:border-primary/30 transition-all">
              <div className="aspect-video bg-surface/50 flex items-center justify-center border-b border-border relative">
                <Video size={40} className="text-foreground-subtle opacity-20 group-hover:scale-110 group-hover:text-primary/40 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <a 
                    href={rec.recording_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2"
                  >
                    Watch Now <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 truncate group-hover:text-primary transition-colors">{rec.title}</h3>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-foreground-subtle">
                  <div className="flex items-center gap-1">
                    <CalendarIcon size={10} />
                    {rec.recording_date ? new Date(rec.recording_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                  </div>
                  {rec.is_public && (
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">Public</span>
                  )}
                </div>
                {rec.description && (
                  <p className="text-xs text-foreground-muted mt-2 line-clamp-2 leading-relaxed">{rec.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
