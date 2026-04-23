'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import RatingSparkline from './RatingSparkline'
import AttendanceIndicator from './AttendanceIndicator'

interface StudentQuickViewProps {
  student: any
  trendData: number[]
  attendanceData: boolean[]
  onClose: () => void
}

export default function StudentQuickView({ student, trendData, attendanceData, onClose }: StudentQuickViewProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)

    // Trap focus
    const drawer = drawerRef.current
    if (drawer) {
      const focusable = drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) focusable[0].focus()
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'oklch(0 0 0 / 0.5)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Student details for ${student.full_name}`}
        className="relative w-full max-w-md bg-background border-l border-border/20 p-6 overflow-y-auto shadow-2xl"
        style={{
          animation: 'slideInRight 0.28s ease-out forwards',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Student Name */}
        <h2
          className="text-2xl font-bold text-foreground mb-1 pr-8"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {student.full_name}
        </h2>
        {student.school && (
          <p className="text-sm text-foreground-muted mb-6">{student.school}</p>
        )}

        {/* Rating */}
        <div className="mb-6">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-1">Current Rating</p>
          <p className="text-3xl font-bold text-foreground font-data">
            {student.chess_rating ?? '—'}
          </p>
        </div>

        {/* Large Sparkline */}
        <div className="mb-6">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-2">Rating Trend (7 sessions)</p>
          <div className="p-3 rounded-lg bg-surface border border-border/20">
            <RatingSparkline data={trendData} width={280} height={60} />
          </div>
        </div>

        {/* Attendance */}
        <div className="mb-6">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-2">Last 5 Sessions</p>
          <div className="flex items-center gap-2">
            <AttendanceIndicator attended={attendanceData} />
            <span className="text-xs text-foreground-muted ml-2">
              {attendanceData.filter(Boolean).length}/{attendanceData.length} attended
            </span>
          </div>
        </div>

        {/* Skill Level */}
        {student.skill_level && (
          <div className="mb-6">
            <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-1">Skill Level</p>
            <span className="inline-flex px-3 py-1 text-sm rounded-full font-medium capitalize bg-accent/10 text-accent">
              {student.skill_level}
            </span>
          </div>
        )}

        {/* Full Profile Link */}
        <Link
          href={`/admin/students/${student.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-primary-foreground font-semibold text-sm hover:bg-accent-hover transition-all duration-200 mt-4 w-full justify-center"
        >
          Full Profile
        </Link>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
