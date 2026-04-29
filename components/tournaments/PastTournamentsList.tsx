'use client'

import { Trophy, Medal, TrendingUp, TrendingDown } from 'lucide-react'
import type { PastTournament } from '@/lib/actions/tournaments'
import Link from 'next/link'

interface PastTournamentsListProps {
  tournaments: PastTournament[]
  studentRating?: number | null
}

function medalBadge(medal: string | null) {
  if (!medal || medal === 'none') return null

  const map: Record<string, string> = {
    gold: 'bg-grandmaster-gold/15 text-grandmaster-gold',
    silver: 'bg-bishop-slate/15 text-bishop-slate',
    bronze: 'bg-rook-copper/15 text-rook-copper',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[medal] ?? ''}`}>
      <Medal size={12} />
      {medal.charAt(0).toUpperCase() + medal.slice(1)}
    </span>
  )
}

export default function PastTournamentsList({ tournaments, studentRating }: PastTournamentsListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Trophy size={36} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted text-sm">No past tournament results yet</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left p-4 text-foreground-muted font-medium">Tournament</th>
              <th className="text-center p-4 text-foreground-muted font-medium">Date</th>
              <th className="text-center p-4 text-foreground-muted font-medium">Rank</th>
              <th className="text-center p-4 text-foreground-muted font-medium">Score</th>
              <th className="text-center p-4 text-foreground-muted font-medium">Performance</th>
              <th className="text-center p-4 text-foreground-muted font-medium">Medal</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t, idx) => {
              const ratingDiff = t.performance_rating && studentRating
                ? t.performance_rating - studentRating
                : null

              return (
                <tr
                  key={t.id}
                  className={`border-b border-border-subtle/50 transition-colors hover:bg-surface-hover ${
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-surface-raised/30'
                  }`}
                >
                  <td className="p-4">
                    <Link
                      href={`/student/tournaments/${t.id}`}
                      className="font-medium text-foreground hover:text-grandmaster-gold transition-colors"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="p-4 text-center font-data text-foreground-muted">
                    {new Date(t.tournament_date + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4 text-center font-data font-medium text-foreground">
                    {t.rank ? `#${t.rank}` : '—'}
                  </td>
                  <td className="p-4 text-center font-data text-foreground-muted">
                    {t.score ?? '—'}
                  </td>
                  <td className="p-4 text-center">
                    {t.performance_rating ? (
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-data text-foreground">{t.performance_rating}</span>
                        {ratingDiff !== null && (
                          <span className={`flex items-center text-xs font-data ${
                            ratingDiff >= 0 ? 'text-grandmaster-gold' : 'text-rook-copper'
                          }`}>
                            {ratingDiff >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {ratingDiff >= 0 ? '+' : ''}{ratingDiff}
                          </span>
                        )}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="p-4 text-center">
                    {medalBadge(t.medal) ?? <span className="text-foreground-subtle">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-border-subtle/50">
        {tournaments.map((t) => (
          <div key={t.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/student/tournaments/${t.id}`}
                className="font-medium text-foreground hover:text-grandmaster-gold transition-colors"
              >
                {t.name}
              </Link>
              {medalBadge(t.medal)}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-foreground-subtle text-xs">Rank</p>
                <p className="font-data">{t.rank ? `#${t.rank}` : '—'}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs">Score</p>
                <p className="font-data">{t.score ?? '—'}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs">Performance</p>
                <p className="font-data">{t.performance_rating ?? '—'}</p>
              </div>
            </div>
            <p className="text-xs text-foreground-subtle font-data">
              {new Date(t.tournament_date + 'T00:00:00').toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
