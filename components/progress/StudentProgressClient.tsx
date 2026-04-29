'use client'

import RatingChart from '@/components/progress/RatingChart'
import CoachFeedbackList from '@/components/progress/CoachFeedbackList'
import GameResultLog from '@/components/progress/GameResultLog'
import AttendanceSection from '@/components/progress/AttendanceSection'
import { AnimatedSection } from '@/components/shared/AnimatedContainers'
import type { ProgressData } from '@/lib/actions/progress'

interface StudentProgressClientProps {
  progressData: ProgressData
}

export default function StudentProgressClient({ progressData }: StudentProgressClientProps) {
  return (
    <div className="space-y-6">
      {/* Rating Chart — top */}
      <AnimatedSection delay={0.1}>
        <RatingChart ratingHistory={progressData.ratingHistory} />
      </AnimatedSection>

      {/* Game Results + Attendance — side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedSection delay={0.2}>
          <GameResultLog
            entries={progressData.entries}
            totalWins={progressData.totalWins}
            totalLosses={progressData.totalLosses}
            totalDraws={progressData.totalDraws}
            totalGames={progressData.totalGames}
            winRate={progressData.winRate}
          />
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <AttendanceSection
            entries={progressData.entries}
            attendancePercent={progressData.attendancePercent}
          />
        </AnimatedSection>
      </div>

      {/* Coach Feedback — below */}
      <AnimatedSection delay={0.4}>
        <CoachFeedbackList entries={progressData.entries} />
      </AnimatedSection>
    </div>
  )
}
