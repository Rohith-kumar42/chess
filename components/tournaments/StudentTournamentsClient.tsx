'use client'

import { useState } from 'react'
import { CalendarCheck, History } from 'lucide-react'
import UpcomingTournamentsList from '@/components/tournaments/UpcomingTournamentsList'
import PastTournamentsList from '@/components/tournaments/PastTournamentsList'
import { AnimatedSection } from '@/components/shared/AnimatedContainers'
import type { StudentTournamentData } from '@/lib/actions/tournaments'

interface StudentTournamentsClientProps {
  tournamentData: StudentTournamentData
  studentId: string
  studentRating: number | null
}

type Tab = 'upcoming' | 'history'

export default function StudentTournamentsClient({
  tournamentData,
  studentId,
  studentRating,
}: StudentTournamentsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')

  const tabs = [
    { key: 'upcoming' as Tab, label: 'Upcoming Tournaments', icon: <CalendarCheck size={16} />, count: tournamentData.upcoming.length },
    { key: 'history' as Tab, label: 'My Tournament History', icon: <History size={16} />, count: tournamentData.past.length },
  ]

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <AnimatedSection>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-raised w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-grandmaster-gold text-primary-foreground'
                  : 'text-foreground-muted hover:bg-surface-hover'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.key === 'upcoming' ? 'Upcoming' : 'History'}</span>
              {tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-data ${
                  activeTab === tab.key
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-surface-hover text-foreground-subtle'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </AnimatedSection>

      {/* Tab Content */}
      <AnimatedSection delay={0.15}>
        {activeTab === 'upcoming' ? (
          <UpcomingTournamentsList
            tournaments={tournamentData.upcoming}
            studentId={studentId}
          />
        ) : (
          <PastTournamentsList
            tournaments={tournamentData.past}
            studentRating={studentRating}
          />
        )}
      </AnimatedSection>
    </div>
  )
}
