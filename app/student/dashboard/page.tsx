import { getStudentDashboardData } from '@/lib/queries/student'
import { Calendar, Video, TrendingUp, IndianRupee, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function StudentDashboard() {
  const data = await getStudentDashboardData()

  if (!data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <div className="glass-card p-12 text-center border-warning/20">
          <p className="text-foreground-muted">Profile not found. Please contact your administrator.</p>
        </div>
      </div>
    )
  }

  const { upcomingSessions, recentRecordings, recentProgress, recentFees } = data

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-foreground-muted mt-1">Welcome back! Here's your chess journey overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sessions & Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Sessions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Upcoming Classes
              </h2>
              <Link href="/student/schedule" className="text-sm text-primary hover:underline">View full schedule</Link>
            </div>
            
            {upcomingSessions.length === 0 ? (
              <div className="glass-card p-8 text-center bg-surface/30">
                <Calendar size={32} className="mx-auto text-foreground-subtle mb-3 opacity-30" />
                <p className="text-foreground-muted text-sm">No classes scheduled yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingSessions.map((session: any) => (
                  <div key={session.id} className="glass-card p-5 hover:border-primary/20 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Calendar size={18} />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface border border-border">
                        {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{session.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-foreground-muted mb-4">
                      <Clock size={14} />
                      {session.start_time?.slice(0, 5)}
                    </div>
                    {session.zoom_link && (
                      <a 
                        href={session.zoom_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
                      >
                        <Video size={16} />
                        Join Zoom Class
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Progress */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" />
                Recent Progress
              </h2>
              <Link href="/student/progress" className="text-sm text-primary hover:underline">View history</Link>
            </div>
            
            {recentProgress.length === 0 ? (
              <div className="glass-card p-8 text-center bg-surface/30">
                <TrendingUp size={32} className="mx-auto text-foreground-subtle mb-3 opacity-30" />
                <p className="text-foreground-muted text-sm">No progress notes yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProgress.map((entry: any) => (
                  <div key={entry.id} className="glass-card p-5 flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <TrendingUp size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">Coach Remarks</h3>
                        <span className="text-xs text-foreground-subtle">
                          {new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-muted line-clamp-2 italic">"{entry.coach_remarks}"</p>
                      {entry.homework && (
                        <div className="mt-3 p-2 rounded bg-surface/50 border border-border/50">
                          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle mb-1">Homework</p>
                          <p className="text-sm text-foreground-muted">{entry.homework}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Recordings & Fees */}
        <div className="space-y-8">
          {/* Recent Recordings */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Video size={20} className="text-info" />
              Recent Recordings
            </h2>
            {recentRecordings.length === 0 ? (
              <div className="glass-card p-6 text-center bg-surface/30">
                <Video size={24} className="mx-auto text-foreground-subtle mb-2 opacity-30" />
                <p className="text-foreground-muted text-xs">No recordings available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecordings.map((rec: any) => (
                  <a 
                    key={rec.id} 
                    href={rec.recording_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-primary/30 hover:bg-surface-hover transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Video size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{rec.title}</p>
                      <p className="text-xs text-foreground-subtle">{rec.recording_date}</p>
                    </div>
                    <ExternalLink size={14} className="text-foreground-subtle" />
                  </a>
                ))}
                <Link href="/student/recordings" className="block text-center text-xs text-primary hover:underline mt-2">
                  View all recordings
                </Link>
              </div>
            )}
          </section>

          {/* Recent Fees */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <IndianRupee size={20} className="text-success" />
              Fees & Payments
            </h2>
            {recentFees.length === 0 ? (
              <div className="glass-card p-6 text-center bg-surface/30">
                <IndianRupee size={24} className="mx-auto text-foreground-subtle mb-2 opacity-30" />
                <p className="text-foreground-muted text-xs">No fee history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFees.map((fee: any) => (
                  <div key={fee.id} className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(fee.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        fee.status === 'paid' ? 'bg-success/10 text-success' :
                        fee.status === 'partially_paid' ? 'bg-warning/10 text-warning' :
                        'bg-danger/10 text-danger'
                      }`}>
                        {fee.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-foreground">₹{Number(fee.amount_due).toLocaleString()}</p>
                      {fee.balance > 0 && (
                        <p className="text-[10px] text-danger font-medium">Due: ₹{Number(fee.balance).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
