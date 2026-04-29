'use client'

import { useState } from 'react'
import { MessageSquare, ChevronDown, ChevronUp, BookOpen, Target, ClipboardList } from 'lucide-react'
import type { ProgressEntry } from '@/types/app.types'

interface CoachFeedbackListProps {
  entries: ProgressEntry[]
}

export default function CoachFeedbackList({ entries }: CoachFeedbackListProps) {
  const [showAll, setShowAll] = useState(false)

  // Sort by date descending (newest first)
  const sorted = [...entries]
    .filter((e) => e.coach_remarks)
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))

  const displayed = showAll ? sorted : sorted.slice(0, 3)

  if (sorted.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <MessageSquare size={36} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted text-sm">No coach feedback yet</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3
        className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <MessageSquare size={18} className="text-grandmaster-gold" />
        Coach Feedback
      </h3>

      <div className="space-y-3">
        {displayed.map((entry) => (
          <FeedbackCard key={entry.id} entry={entry} />
        ))}
      </div>

      {sorted.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex items-center gap-1.5 text-sm text-grandmaster-gold hover:text-gold-hover transition-colors mx-auto"
          aria-expanded={showAll}
        >
          {showAll ? (
            <>Show less <ChevronUp size={16} /></>
          ) : (
            <>Show all {sorted.length} entries <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </div>
  )
}

function FeedbackCard({ entry }: { entry: ProgressEntry }) {
  const [expanded, setExpanded] = useState(false)

  const hasDetails =
    entry.areas_to_improve || entry.homework || (entry.openings_studied && entry.openings_studied.length > 0)

  return (
    <div
      className="p-4 rounded-lg bg-surface-raised border border-border-subtle/50 hover:bg-surface-hover transition-colors"
      role="article"
      aria-label={`Feedback from ${entry.entry_date}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground-subtle font-data mb-1">
            {new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm text-foreground">{entry.coach_remarks}</p>
        </div>

        {hasDetails && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md hover:bg-surface-hover text-foreground-muted flex-shrink-0"
            aria-expanded={expanded}
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Topics */}
      {entry.tactics_topics && entry.tactics_topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {entry.tactics_topics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 text-xs rounded-full bg-bishop-slate/10 text-bishop-slate"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Expanded details */}
      {expanded && hasDetails && (
        <div className="mt-3 pt-3 border-t border-border-subtle/50 space-y-2">
          {entry.areas_to_improve && (
            <div className="flex items-start gap-2 text-sm">
              <Target size={14} className="text-rook-copper mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-foreground-subtle font-medium">Areas to Improve</p>
                <p className="text-foreground-muted">{entry.areas_to_improve}</p>
              </div>
            </div>
          )}
          {entry.homework && (
            <div className="flex items-start gap-2 text-sm">
              <ClipboardList size={14} className="text-grandmaster-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-foreground-subtle font-medium">Homework</p>
                <p className="text-foreground-muted">{entry.homework}</p>
              </div>
            </div>
          )}
          {entry.openings_studied && entry.openings_studied.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <BookOpen size={14} className="text-bishop-slate mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-foreground-subtle font-medium">Openings Studied</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {entry.openings_studied.map((o) => (
                    <span key={o} className="px-2 py-0.5 text-xs rounded-full bg-grandmaster-gold/10 text-grandmaster-gold">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
