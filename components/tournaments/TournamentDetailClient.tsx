'use client'

import { ArrowLeft, MapPin, Calendar, Tag, ExternalLink, Users, Medal, Trophy } from 'lucide-react'
import Link from 'next/link'
import type { TournamentDetail } from '@/lib/actions/tournaments'
import { AnimatedSection } from '@/components/shared/AnimatedContainers'

interface TournamentDetailClientProps {
  tournament: TournamentDetail
  currentStudentId: string | null
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    upcoming: 'bg-bishop-slate/15 text-bishop-slate',
    ongoing: 'bg-grandmaster-gold/15 text-grandmaster-gold',
    completed: 'bg-foreground-subtle/15 text-foreground-muted',
  }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${map[status] ?? 'bg-surface-hover text-foreground-muted'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function medalIcon(medal: string | null) {
  if (!medal || medal === 'none') return null

  const map: Record<string, string> = {
    gold: 'text-grandmaster-gold',
    silver: 'text-bishop-slate',
    bronze: 'text-rook-copper',
  }

  return <Medal size={16} className={map[medal] ?? ''} />
}

export default function TournamentDetailClient({ tournament, currentStudentId }: TournamentDetailClientProps) {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/student/tournaments"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Tournaments
      </Link>

      {/* Header */}
      <AnimatedSection>
        <div className="glass-card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-2xl font-bold text-foreground mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {tournament.name}
              </h1>
              {statusBadge(tournament.status)}
            </div>

            {tournament.registration_url && (
              <a
                href={tournament.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-grandmaster-gold text-primary-foreground text-sm font-medium hover:bg-gold-hover transition-colors"
              >
                <ExternalLink size={14} />
                Registration Link
              </a>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-start gap-2">
              <Calendar size={16} className="text-foreground-subtle mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-foreground-subtle">Date</p>
                <p className="text-sm font-data text-foreground">
                  {new Date(tournament.tournament_date + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {tournament.end_date && tournament.end_date !== tournament.tournament_date && (
                    <> – {new Date(tournament.end_date + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                    })}</>
                  )}
                </p>
              </div>
            </div>

            {tournament.location && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-foreground-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground-subtle">Location</p>
                  <p className="text-sm text-foreground">{tournament.location}</p>
                </div>
              </div>
            )}

            {tournament.format && (
              <div className="flex items-start gap-2">
                <Tag size={16} className="text-foreground-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground-subtle">Format</p>
                  <p className="text-sm text-foreground">{tournament.format}</p>
                </div>
              </div>
            )}

            {tournament.organizer && (
              <div className="flex items-start gap-2">
                <Users size={16} className="text-foreground-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground-subtle">Organizer</p>
                  <p className="text-sm text-foreground">{tournament.organizer}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {tournament.description && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-sm text-foreground-muted leading-relaxed">{tournament.description}</p>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Leaderboard */}
      <AnimatedSection delay={0.2}>
        <div className="glass-card p-6">
          <h2
            className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Trophy size={18} className="text-grandmaster-gold" />
            Leaderboard
            <span className="text-sm font-normal text-foreground-muted">
              ({tournament.participants.length} participant{tournament.participants.length !== 1 ? 's' : ''})
            </span>
          </h2>

          {tournament.participants.length === 0 ? (
            <div className="text-center py-6">
              <Users size={32} className="mx-auto text-foreground-subtle mb-2 opacity-40" />
              <p className="text-foreground-muted text-sm">No participants recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left p-3 text-foreground-muted font-medium">Rank</th>
                    <th className="text-left p-3 text-foreground-muted font-medium">Name</th>
                    <th className="text-center p-3 text-foreground-muted font-medium">Score</th>
                    <th className="text-center p-3 text-foreground-muted font-medium">Performance</th>
                    <th className="text-center p-3 text-foreground-muted font-medium">Medal</th>
                  </tr>
                </thead>
                <tbody>
                  {tournament.participants.map((p, idx) => {
                    const isCurrentStudent = p.student_id === currentStudentId

                    return (
                      <tr
                        key={p.student_id}
                        className={`border-b border-border-subtle/50 transition-colors ${
                          isCurrentStudent
                            ? 'bg-grandmaster-gold/5 border-l-2 border-l-grandmaster-gold'
                            : idx % 2 === 0
                              ? 'bg-transparent'
                              : 'bg-surface-raised/30'
                        } hover:bg-surface-hover`}
                      >
                        <td className="p-3 font-data font-medium text-foreground">
                          {p.rank ? `#${p.rank}` : '—'}
                        </td>
                        <td className="p-3">
                          <span className={`font-medium ${isCurrentStudent ? 'text-grandmaster-gold' : 'text-foreground'}`}>
                            {p.full_name}
                            {isCurrentStudent && (
                              <span className="ml-1.5 text-xs text-grandmaster-gold">(You)</span>
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-center font-data text-foreground-muted">
                          {p.score ?? '—'}
                        </td>
                        <td className="p-3 text-center font-data text-foreground-muted">
                          {p.performance_rating ?? '—'}
                        </td>
                        <td className="p-3 text-center">
                          {medalIcon(p.medal) ?? <span className="text-foreground-subtle">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  )
}
