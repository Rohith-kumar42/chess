import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { createSession } from '@/lib/actions/sessions'
import { redirect } from 'next/navigation'

export default async function NewSessionPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name')

  async function handleSubmit(formData: FormData) {
    'use server'
    await createSession(formData)
    redirect('/admin/schedule')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Calendar size={24} className="text-primary" />
        Schedule New Session
      </h1>
      
      <div className="glass-card p-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground-muted">Session Title</label>
            <input type="text" name="title" required placeholder="e.g. Masterclass on Endgames" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground-muted">Date</label>
              <input type="date" name="session_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground-muted">Start Time</label>
                <input type="time" name="start_time" required defaultValue="17:00" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground-muted">End Time</label>
                <input type="time" name="end_time" defaultValue="18:00" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground-muted">Zoom/Meeting Link</label>
            <input type="url" name="zoom_link" placeholder="https://zoom.us/j/..." className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground-muted">Meeting Password (Optional)</label>
              <input type="text" name="zoom_password" placeholder="Passcode" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-[42px]">
                <input type="checkbox" name="is_recurring" value="true" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 bg-surface" />
                <span className="text-sm text-foreground-muted font-medium">Recurring Weekly Session</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground-muted">Students</label>
            <p className="text-xs text-foreground-subtle mb-2">Hold Ctrl/Cmd to select multiple</p>
            <select name="student_ids" multiple size={5} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              {students?.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground-muted">Description (Optional)</label>
            <textarea name="description" rows={3} placeholder="Topics covered, homework discussion, etc." className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Link href="/admin/schedule" className="px-6 py-2.5 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors">
              Schedule Session
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
