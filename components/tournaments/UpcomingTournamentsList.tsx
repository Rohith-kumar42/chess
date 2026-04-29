'use client'

import { useState } from 'react'
import { MapPin, Calendar, Tag, ExternalLink, CheckCircle, Loader2 } from 'lucide-react'
import type { TournamentWithRegistration } from '@/lib/actions/tournaments'
import { registerForTournament } from '@/lib/actions/tournaments'
import Link from 'next/link'

interface UpcomingTournamentsListProps {
  tournaments: TournamentWithRegistration[]
  studentId: string
}

export default function UpcomingTournamentsList({ tournaments, studentId }: UpcomingTournamentsListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Calendar size={36} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted text-sm">No upcoming tournaments</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tournaments.map((t) => (
        <TournamentCard key={t.id} tournament={t} studentId={studentId} />
      ))}
    </div>
  )
}

function TournamentCard({ tournament, studentId }: { tournament: TournamentWithRegistration; studentId: string }) {
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(tournament.isRegistered)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    setRegistering(true)
    setError('')
    try {
      await registerForTournament(tournament.id, studentId)
      setRegistered(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="glass-card p-5 flex flex-col hover:scale-[1.01] transition-transform duration-200">
      <Link
        href={`/student/tournaments/${tournament.id}`}
        className="text-base font-semibold text-foreground hover:text-grandmaster-gold transition-colors mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {tournament.name}
      </Link>

      <div className="space-y-1.5 text-sm text-foreground-muted mb-4 flex-1">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-foreground-subtle flex-shrink-0" />
          <span className="font-data">
            {new Date(tournament.tournament_date + 'T00:00:00').toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {tournament.end_date && tournament.end_date !== tournament.tournament_date && (
              <> – {new Date(tournament.end_date + 'T00:00:00').toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}</>
            )}
          </span>
        </div>

        {tournament.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-foreground-subtle flex-shrink-0" />
            <span>{tournament.location}</span>
          </div>
        )}

        {tournament.format && (
          <div className="flex items-center gap-1.5">
            <Tag size={14} className="text-foreground-subtle flex-shrink-0" />
            <span className="px-2 py-0.5 text-xs rounded-full bg-bishop-slate/10 text-bishop-slate">
              {tournament.format}
            </span>
          </div>
        )}

        {tournament.organizer && (
          <p className="text-xs text-foreground-subtle">By {tournament.organizer}</p>
        )}
      </div>

      {/* Registration CTA */}
      {registered ? (
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-grandmaster-gold/10 text-grandmaster-gold text-sm font-medium justify-center">
          <CheckCircle size={16} />
          Registered
        </div>
      ) : (
        <button
          onClick={handleRegister}
          disabled={registering}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-grandmaster-gold text-primary-foreground text-sm font-medium hover:bg-gold-hover transition-colors justify-center disabled:opacity-60"
        >
          {registering ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Registering…
            </>
          ) : (
            'Register Interest'
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-danger mt-1 text-center">{error}</p>
      )}

      {tournament.registration_url && (
        <a
          href={tournament.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-bishop-slate hover:underline mt-2 justify-center"
        >
          <ExternalLink size={12} />
          External Registration
        </a>
      )}
    </div>
  )
}
