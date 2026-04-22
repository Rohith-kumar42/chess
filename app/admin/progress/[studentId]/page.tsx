import { TrendingUp } from 'lucide-react'

export default function StudentProgressPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Student Progress History</h1>
      <div className="glass-card p-12 text-center">
        <TrendingUp size={48} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted">Full progress timeline for this student</p>
      </div>
    </div>
  )
}
