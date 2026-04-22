import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { createTournament } from '@/lib/actions/tournaments'
import { redirect } from 'next/navigation'

export default function NewTournamentPage() {
  async function handleSubmit(formData: FormData) {
    'use server'
    await createTournament(formData)
    redirect('/admin/tournaments')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Trophy size={24} className="text-primary" />
        Add Tournament
      </h1>
      
      <div className="glass-card p-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground-muted">Tournament Name</label>
            <input type="text" name="name" required placeholder="e.g. State Level Open Chess Tournament" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground-muted">Start Date</label>
              <input type="date" name="tournament_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground-muted">End Date (Optional)</label>
              <input type="date" name="end_date" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground-muted">Location</label>
              <input type="text" name="location" placeholder="e.g. Chennai, TN or Online" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground-muted">Format</label>
              <input type="text" name="format" placeholder="e.g. Swiss System, 7 Rounds, Rapid" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground-muted">Organizer</label>
              <input type="text" name="organizer" placeholder="e.g. District Chess Association" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground-muted">Registration Link</label>
              <input type="url" name="registration_url" placeholder="https://..." className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground-muted">Description & Details</label>
            <textarea name="description" rows={3} placeholder="Additional info, eligibility, entry fee, prize fund..." className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Link href="/admin/tournaments" className="px-6 py-2.5 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors">
              Create Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
