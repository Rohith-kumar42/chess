import { getParentDashboardData } from '@/lib/queries/parent'
import { IndianRupee, TrendingUp, AlertCircle, ChevronRight, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default async function ParentDashboard() {
  const data = await getParentDashboardData()

  if (!data || !data.children || data.children.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
        <div className="glass-card p-12 text-center border-warning/20">
          <AlertCircle size={48} className="mx-auto text-warning mb-4 opacity-40" />
          <p className="text-foreground-muted">No linked students found. Please contact the academy to link your account to your child&apos;s profile.</p>
        </div>
      </div>
    )
  }

  const { children } = data

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
        <p className="text-foreground-muted mt-1">Manage your children&apos;s chess education and fees.</p>
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 gap-8">
        {children.map((child: any) => {
          const unpaidFees = child.fees?.filter((f: any) => f.status !== 'paid') || []
          const totalDue = unpaidFees.reduce((sum: number, f: any) => sum + Number(f.balance), 0)
          const latestProgress = child.progress_entries?.[0]

          return (
            <div key={child.id} className="glass-card overflow-hidden">
              <div className="p-6 border-b border-border bg-surface/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                      {child.full_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{child.full_name}</h2>
                      <p className="text-foreground-muted text-sm capitalize">{child.skill_level || 'Beginner'} · {child.chess_rating || 'No'} Rating</p>
                    </div>
                  </div>
                  <Link 
                    href={`/student/dashboard`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
                  >
                    View Student Profile <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Fee Status */}
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IndianRupee size={18} className="text-success" />
                    Fee Status
                  </h3>
                  {totalDue > 0 ? (
                    <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
                      <p className="text-sm text-foreground-muted mb-1">Total Outstanding</p>
                      <p className="text-2xl font-bold text-danger">₹{totalDue.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-danger/80 mt-1">{unpaidFees.length} pending months</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                      <p className="text-sm text-success font-medium">All fees are up to date!</p>
                    </div>
                  )}
                  <Link href="/parent/fees" className="text-sm text-primary hover:underline flex items-center gap-1">
                    View payment history <ChevronRight size={14} />
                  </Link>
                </div>

                {/* Latest Progress */}
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp size={18} className="text-accent" />
                    Latest Progress
                  </h3>
                  {latestProgress ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {new Date(latestProgress.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={`text-xs font-bold uppercase ${
                          latestProgress.game_result === 'win' ? 'text-success' :
                          latestProgress.game_result === 'loss' ? 'text-danger' :
                          'text-warning'
                        }`}>
                          {latestProgress.game_result || 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-muted line-clamp-3 italic">&quot;{latestProgress.coach_remarks}&quot;</p>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground-subtle italic py-4 text-center">No progress reports available yet.</p>
                  )}
                  <Link href="/parent/progress" className="text-sm text-primary hover:underline flex items-center gap-1">
                    View all reports <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
