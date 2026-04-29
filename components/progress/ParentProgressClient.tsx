'use client'

import { useState } from 'react'
import { Users, Eye } from 'lucide-react'
import StudentProgressClient from '@/components/progress/StudentProgressClient'
import { AnimatedSection } from '@/components/shared/AnimatedContainers'
import type { Student } from '@/types/app.types'
import type { ProgressData } from '@/lib/actions/progress'

interface ChildProgressData {
  student: Student
  progressData: ProgressData
}

interface ParentProgressClientProps {
  childrenProgress: ChildProgressData[]
}

export default function ParentProgressClient({ childrenProgress }: ParentProgressClientProps) {
  const [activeChild, setActiveChild] = useState(0)
  const activeData = childrenProgress[activeChild]

  if (childrenProgress.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-foreground-muted">No children linked to your account</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Child Switcher */}
      {childrenProgress.length > 1 && (
        <AnimatedSection>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Users size={18} className="text-foreground-muted flex-shrink-0" />
            {childrenProgress.map((cp, idx) => (
              <button
                key={cp.student.id}
                onClick={() => setActiveChild(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  idx === activeChild
                    ? 'bg-grandmaster-gold text-primary-foreground'
                    : 'bg-surface-raised text-foreground-muted hover:bg-surface-hover'
                }`}
              >
                {cp.student.full_name}
              </button>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Read-only Banner */}
      <AnimatedSection delay={0.05}>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bishop-slate/10 border border-bishop-slate/20">
          <Eye size={16} className="text-bishop-slate" />
          <span className="text-sm text-foreground-muted">
            Viewing <strong className="text-foreground">{activeData.student.full_name}</strong>&apos;s Progress
          </span>
        </div>
      </AnimatedSection>

      {/* Reuse all progress components */}
      <StudentProgressClient progressData={activeData.progressData} />
    </div>
  )
}
