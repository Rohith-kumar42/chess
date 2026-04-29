'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Swords } from 'lucide-react'
import type { ProgressEntry } from '@/types/app.types'

interface GameResultLogProps {
  entries: ProgressEntry[]
  totalWins: number
  totalLosses: number
  totalDraws: number
  totalGames: number
  winRate: number
}

const COLORS = {
  win: 'var(--color-grandmaster-gold)',
  loss: 'var(--color-rook-copper)',
  draw: 'var(--color-bishop-slate)',
}

export default function GameResultLog({
  entries,
  totalWins,
  totalLosses,
  totalDraws,
  totalGames,
  winRate,
}: GameResultLogProps) {
  const pieData = [
    { name: 'Wins', value: totalWins, color: COLORS.win },
    { name: 'Losses', value: totalLosses, color: COLORS.loss },
    { name: 'Draws', value: totalDraws, color: COLORS.draw },
  ].filter((d) => d.value > 0)

  // Last 10 games with a result
  const recentGames = [...entries]
    .filter((e) => e.game_result && e.game_result !== 'n/a')
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
    .slice(0, 10)

  if (totalGames === 0) {
    return (
      <div className="glass-card p-8 text-center" aria-label="No game results available">
        <Swords size={36} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted text-sm">No game results recorded yet</p>
      </div>
    )
  }

  return (
    <div
      className="glass-card p-6"
      aria-label={`Game results: ${totalWins} wins, ${totalLosses} losses, ${totalDraws} draws. Win rate ${winRate}%`}
    >
      <h3
        className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <Swords size={18} className="text-grandmaster-gold" />
        Game Results
      </h3>

      {/* Summary row */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-grandmaster-gold" />
          <span className="text-sm font-data text-foreground">{totalWins}W</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rook-copper" />
          <span className="text-sm font-data text-foreground">{totalLosses}L</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-bishop-slate" />
          <span className="text-sm font-data text-foreground">{totalDraws}D</span>
        </div>
        <span className="ml-auto text-lg font-bold font-data text-grandmaster-gold">{winRate}%</span>
      </div>

      {/* Accessible text summary */}
      <p className="sr-only">
        Win rate is {winRate}% across {totalGames} games: {totalWins} wins, {totalLosses} losses, {totalDraws} draws.
      </p>

      {/* Donut Chart */}
      {pieData.length > 0 && (
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]
                  return (
                    <div className="glass-card p-2 text-sm">
                      <p className="font-medium text-foreground">{d.name}: {d.value}</p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Games */}
      {recentGames.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground-muted mb-2">Recent Games</h4>
          <div className="space-y-1.5">
            {recentGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-raised/50 text-sm"
              >
                <span className="text-foreground-muted font-data">
                  {new Date(game.entry_date + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium font-data ${
                    game.game_result === 'win'
                      ? 'bg-grandmaster-gold/15 text-grandmaster-gold'
                      : game.game_result === 'loss'
                        ? 'bg-rook-copper/15 text-rook-copper'
                        : 'bg-bishop-slate/15 text-bishop-slate'
                  }`}
                >
                  {game.game_result?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
