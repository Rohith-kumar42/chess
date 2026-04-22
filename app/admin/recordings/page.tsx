import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Video, Plus, ExternalLink } from 'lucide-react'
import { createRecording } from '@/lib/actions/sessions'

export default async function RecordingsPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const supabase = await createClient()
  const { action } = await searchParams

  const { data: recordings } = await supabase
    .from('recordings')
    .select('*')
    .order('created_at', { ascending: false })

  const showAddForm = action === 'add'

  const { data: students } = showAddForm ? await supabase
    .from('students')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name') : { data: null }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recordings</h1>
          <p className="text-foreground-muted mt-1">{recordings?.length ?? 0} recordings</p>
        </div>
        <Link
          href="/admin/recordings?action=add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-all"
        >
          <Plus size={18} />
          Add Recording
        </Link>
      </div>

      {showAddForm && (
        <div className="glass-card p-6 border-primary/20">
          <h2 className="text-lg font-semibold mb-4">Add Recording</h2>
          <form action={createRecording} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Title</label>
                <input type="text" name="title" required placeholder="Session Topic / Title" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Recording URL</label>
                <input type="url" name="recording_url" required placeholder="https://..." className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-muted">Date</label>
                <input type="date" name="recording_date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer h-[38px]">
                  <input type="checkbox" name="is_public" value="true" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 bg-surface" />
                  <span className="text-sm text-foreground-muted font-medium">Public Recording</span>
                </label>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-foreground-muted">Description</label>
                <textarea name="description" rows={2} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-foreground-muted">Select Specific Students (Leave empty for public recordings)</label>
                <p className="text-xs text-foreground-subtle mb-1">Hold Ctrl/Cmd to select multiple</p>
                <select name="student_ids" multiple size={4} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {students?.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Link href="/admin/recordings" className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover">Cancel</Link>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors">Save Recording</button>
            </div>
          </form>
        </div>
      )}

      {!recordings || recordings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Video size={48} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
          <p className="text-foreground-muted font-medium">No recordings yet</p>
          <p className="text-sm text-foreground-subtle mt-1">Add Zoom, YouTube, or Google Drive links for students</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordings.map((rec) => (
            <div key={rec.id} className="glass-card p-5 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Video size={16} className="text-primary" />
                <h3 className="font-medium text-sm truncate">{rec.title}</h3>
              </div>
              {rec.description && (
                <p className="text-xs text-foreground-muted mb-3 line-clamp-2">{rec.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-foreground-subtle">
                <span>{rec.recording_date ? new Date(rec.recording_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '–'}</span>
                <a href={rec.recording_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover flex items-center gap-1">
                  Open <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
