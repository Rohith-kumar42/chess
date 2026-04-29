'use client'

import { CalendarCheck, Flame } from 'lucide-react'
import type { ProgressEntry } from '@/types/app.types'
import { useMemo } from 'react'

interface AttendanceSectionProps {
  entries: ProgressEntry[]
  attendancePercent: number
}

function getAttendanceColor(percent: number) {
  if (percent >= 80) return { badge: 'bg-grandmaster-gold/15 text-grandmaster-gold', label: 'Excellent' }
  if (percent >= 60) return { badge: 'bg-rook-copper/15 text-rook-copper', label: 'Good' }
  return { badge: 'bg-danger/15 text-danger', label: 'Needs Improvement' }
}

export default function AttendanceSection({ entries, attendancePercent }: AttendanceSectionProps) {
  // Calculate streak: consecutive weeks with at least one session
  const streak = useMemo(() => {
    if (entries.length === 0) return 0

    const now = new Date()
    const getWeekNum = (d: Date) => {
      const start = new Date(d.getFullYear(), 0, 1)
      const diff = d.getTime() - start.getTime()
      return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
    }

    // Get unique weeks with sessions
    const weekYears = new Set(
      entries.map((e) => {
        const d = new Date(e.entry_date)
        return `${d.getFullYear()}-${getWeekNum(d)}`
      })
    )

    // Count consecutive weeks backwards from current week
    let currentStreak = 0
    let checkDate = new Date(now)

    for (let i = 0; i < 52; i++) {
      const weekKey = `${checkDate.getFullYear()}-${getWeekNum(checkDate)}`
      if (weekYears.has(weekKey)) {
        currentStreak++
      } else if (i > 0) {
        // Allow current week to be missing (might not have had session yet)
        break
      }
      checkDate.setDate(checkDate.getDate() - 7)
    }

    return currentStreak
  }, [entries])

  // Monthly heatmap: last 35 days
  const heatmapData = useMemo(() => {
    const today = new Date()
    const days: { date: string; hasSession: boolean; dayLabel: string }[] = []

    // Create a set of session dates
    const sessionDates = new Set(entries.map((e) => e.entry_date))

    for (let i = 34; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        hasSession: sessionDates.has(dateStr),
        dayLabel: d.toLocaleDateString('en-IN', { day: 'numeric' }),
      })
    }

    return days
  }, [entries])

  const attendance = getAttendanceColor(attendancePercent)

  return (
    <div
      className="glass-card p-6"
      aria-label={`Attendance: ${attendancePercent}%, streak: ${streak} weeks`}
    >
      <h3
        className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <CalendarCheck size={18} className="text-grandmaster-gold" />
        Attendance
      </h3>

      {/* Accessible text summary */}
      <p className="sr-only">
        Attendance rate is {attendancePercent}% with a {streak}-week streak.
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {/* Attendance Badge */}
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${attendance.badge}`}>
            {attendancePercent}%
          </span>
          <span className="text-xs text-foreground-subtle">{attendance.label}</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Flame size={16} className={streak > 0 ? 'text-grandmaster-gold' : 'text-foreground-subtle'} />
          <span className="text-sm font-data text-foreground">
            {streak} week{streak !== 1 ? 's' : ''} streak
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div>
        <h4 className="text-xs text-foreground-subtle mb-2">Last 35 Days</h4>
        <div className="grid grid-cols-7 gap-1">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-sm flex items-center justify-center text-[10px] font-data transition-colors ${
                day.hasSession
                  ? 'bg-grandmaster-gold/25 text-grandmaster-gold border border-grandmaster-gold/30'
                  : 'bg-surface-raised text-foreground-subtle border border-border-subtle/30'
              }`}
              title={`${day.date}: ${day.hasSession ? 'Session' : 'No session'}`}
            >
              {day.dayLabel}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-foreground-subtle">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-grandmaster-gold/25 border border-grandmaster-gold/30" />
            Session
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-surface-raised border border-border-subtle/30" />
            No session
          </div>
        </div>
      </div>
    </div>
  )
}
