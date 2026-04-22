import { createClient } from '@/lib/supabase/server'
import { Users, IndianRupee, Calendar, TrendingUp } from 'lucide-react'
import { AnimatedCardGrid, AnimatedCard, AnimatedSection } from '@/components/shared/AnimatedContainers'

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
      accentClass: 'text-grandmaster-gold',
      borderClass: 'border-grandmaster-gold/15',
      bgClass: 'bg-grandmaster-gold/5',
    },
    {
      label: 'Outstanding Dues',
      value: `₹${stats.totalOutstanding.toLocaleString('en-IN')}`,
      icon: <IndianRupee size={22} />,
      accentClass: 'text-rook-copper',
      borderClass: 'border-rook-copper/15',
      bgClass: 'bg-rook-copper/5',
    },
    {
      label: 'Upcoming Sessions',
      value: stats.upcomingSessions.length,
      icon: <Calendar size={22} />,
      accentClass: 'text-bishop-slate',
      borderClass: 'border-bishop-slate/15',
      bgClass: 'bg-bishop-slate/5',
    },
    {
      label: 'Recent Progress',
      value: stats.recentProgress.length,
      icon: <TrendingUp size={22} />,
      accentClass: 'text-grandmaster-gold',
      borderClass: 'border-grandmaster-gold/15',
      bgClass: 'bg-grandmaster-gold/5',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight text-ivory"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Dashboard
        </h1>
        <p className="text-parchment mt-1">Your academy at a glance</p>
      </div>

      {/* Stats Grid — staggered entrance */}
      <AnimatedCardGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <AnimatedCard key={card.label}>
            <div
              className={`glass-card p-5 border ${card.borderClass} hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-parchment font-medium">{card.label}</p>
                  <p className="text-2xl font-bold mt-1 text-ivory font-data">{card.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${card.bgClass} ${card.accentClass}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </AnimatedCardGrid>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <AnimatedSection delay={0.35}>
          <div className="glass-card p-6">
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2 text-ivory"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Calendar size={18} className="text-bishop-slate" />
              Upcoming Sessions
            </h2>
            {stats.upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={40} className="mx-auto text-dust mb-3 opacity-40" />
                <p className="text-parchment text-sm">No upcoming sessions</p>
                <p className="text-dust text-xs mt-1">Schedule your first class to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-board-dark hover:bg-board-mid transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-bishop-slate/10 flex items-center justify-center text-bishop-slate flex-shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-ivory">{session.title}</p>
                      <p className="text-xs text-parchment font-data">
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
        </AnimatedSection>

        {/* Recent Progress */}
        <AnimatedSection delay={0.45}>
          <div className="glass-card p-6">
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2 text-ivory"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <TrendingUp size={18} className="text-grandmaster-gold" />
              Recent Progress
            </h2>
            {stats.recentProgress.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={40} className="mx-auto text-dust mb-3 opacity-40" />
                <p className="text-parchment text-sm">No progress entries yet</p>
                <p className="text-dust text-xs mt-1">Add student progress notes after sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentProgress.map((entry: any) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-board-dark hover:bg-board-mid transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-grandmaster-gold/10 flex items-center justify-center text-grandmaster-gold flex-shrink-0">
                      <TrendingUp size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-ivory">{entry.students?.full_name}</p>
                      <p className="text-xs text-parchment truncate">{entry.coach_remarks}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium font-data ${
                      entry.game_result === 'win' ? 'bg-grandmaster-gold/10 text-grandmaster-gold' :
                      entry.game_result === 'loss' ? 'bg-rook-copper/10 text-rook-copper' :
                      entry.game_result === 'draw' ? 'bg-gold-muted/10 text-gold-muted' :
                      'bg-board-mid text-parchment'
                    }`}>
                      {entry.game_result || 'n/a'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
