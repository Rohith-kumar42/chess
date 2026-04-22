import { createClient } from '@/lib/supabase/server'
import { Users, IndianRupee, Calendar, TrendingUp } from 'lucide-react'

async function getDashboardStats() {
  const supabase = await createClient()

  const [studentsRes, feesRes, sessionsRes, progressRes] = await Promise.all([
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('fees')
      .select('balance')
      .neq('status', 'paid'),
    supabase
      .from('sessions')
      .select('*')
      .gte('session_date', new Date().toISOString().split('T')[0])
      .order('session_date', { ascending: true })
      .limit(5),
    supabase
      .from('progress_entries')
      .select('*, students(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    totalStudents: studentsRes.count ?? 0,
    totalOutstanding: feesRes.data?.reduce((sum, f) => sum + Number(f.balance), 0) ?? 0,
    upcomingSessions: sessionsRes.data ?? [],
    recentProgress: progressRes.data ?? [],
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      label: 'Active Students',
      value: stats.totalStudents,
      icon: <Users size={22} />,
      color: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
      border: 'border-primary/20',
    },
    {
      label: 'Outstanding Dues',
      value: `₹${stats.totalOutstanding.toLocaleString('en-IN')}`,
      icon: <IndianRupee size={22} />,
      color: 'from-warning/20 to-warning/5',
      iconColor: 'text-warning',
      border: 'border-warning/20',
    },
    {
      label: 'Upcoming Sessions',
      value: stats.upcomingSessions.length,
      icon: <Calendar size={22} />,
      color: 'from-info/20 to-info/5',
      iconColor: 'text-info',
      border: 'border-info/20',
    },
    {
      label: 'Recent Progress',
      value: stats.recentProgress.length,
      icon: <TrendingUp size={22} />,
      color: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
      border: 'border-accent/20',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-foreground-muted mt-1">Overview of your chess academy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`glass-card p-5 bg-gradient-to-br ${card.color} border ${card.border} hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground-muted font-medium">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-surface/50 ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-info" />
            Upcoming Sessions
          </h2>
          {stats.upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={40} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
              <p className="text-foreground-muted text-sm">No upcoming sessions</p>
              <p className="text-foreground-subtle text-xs mt-1">Schedule your first class to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.upcomingSessions.map((session: any) => (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info flex-shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    <p className="text-xs text-foreground-muted">
                      {new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {session.start_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Progress */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            Recent Progress Entries
          </h2>
          {stats.recentProgress.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp size={40} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
              <p className="text-foreground-muted text-sm">No progress entries yet</p>
              <p className="text-foreground-subtle text-xs mt-1">Add student progress notes after sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentProgress.map((entry: any) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                    <TrendingUp size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{entry.students?.full_name}</p>
                    <p className="text-xs text-foreground-muted truncate">{entry.coach_remarks}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    entry.game_result === 'win' ? 'bg-success/10 text-success' :
                    entry.game_result === 'loss' ? 'bg-danger/10 text-danger' :
                    entry.game_result === 'draw' ? 'bg-warning/10 text-warning' :
                    'bg-surface text-foreground-muted'
                  }`}>
                    {entry.game_result || 'n/a'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
