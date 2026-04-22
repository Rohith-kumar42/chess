import { IndianRupee } from 'lucide-react'

export default function StudentFeesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Student Fee History</h1>
      <div className="glass-card p-12 text-center">
        <IndianRupee size={48} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted">Detailed fee history for this student</p>
      </div>
    </div>
  )
}
