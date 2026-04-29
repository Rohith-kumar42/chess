'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { RatingHistoryPoint } from '@/lib/actions/progress'

interface RatingChartProps {
  ratingHistory: RatingHistoryPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: RatingHistoryPoint; value: number }>
  label?: string
}

function ChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  const prevIdx =
    payload[0].payload
      ? undefined
      : undefined
  return (
    <div className="glass-card p-3 text-sm">
      <p className="text-foreground font-medium">
        {new Date(point.date + 'T00:00:00').toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
      <p className="text-grandmaster-gold font-data font-bold">Rating: {point.rating}</p>
    </div>
  )
}

export default function RatingChart({ ratingHistory }: RatingChartProps) {
  if (ratingHistory.length === 0) {
    return (
      <div className="glass-card p-8 text-center" aria-label="No rating history available">
        <TrendingUp size={40} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted font-medium">No rating history recorded yet</p>
        <p className="text-foreground-subtle text-xs mt-1">Ratings will appear here after your sessions</p>
      </div>
    )
  }

  // Compute data with change
  const chartData = ratingHistory.map((point, idx) => ({
    ...point,
    formattedDate: new Date(point.date + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    }),
    change: idx > 0 ? point.rating - ratingHistory[idx - 1].rating : 0,
  }))

  const minRating = Math.min(...ratingHistory.map((r) => r.rating))
  const maxRating = Math.max(...ratingHistory.map((r) => r.rating))
  const yMin = Math.max(0, minRating - 50)
  const yMax = maxRating + 50

  const latestRating = ratingHistory[ratingHistory.length - 1].rating
  const firstRating = ratingHistory[0].rating
  const totalChange = latestRating - firstRating

  return (
    <div className="glass-card p-6" aria-label={`Rating chart showing ${ratingHistory.length} data points. Current rating: ${latestRating}`}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold flex items-center gap-2 text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <TrendingUp size={18} className="text-grandmaster-gold" />
          Academy Rating
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold font-data text-foreground">{latestRating}</p>
          <p className={`text-xs font-data ${totalChange >= 0 ? 'text-grandmaster-gold' : 'text-rook-copper'}`}>
            {totalChange >= 0 ? '+' : ''}{totalChange} overall
          </p>
        </div>
      </div>

      {/* Accessible text summary */}
      <p className="sr-only">
        Rating trend from {firstRating} to {latestRating}, a change of {totalChange >= 0 ? '+' : ''}{totalChange} points
        over {ratingHistory.length} sessions.
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle)"
              opacity={0.4}
            />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: 'var(--color-foreground-subtle)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fill: 'var(--color-foreground-subtle)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="var(--color-grandmaster-gold)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--color-grandmaster-gold)', r: 4 }}
              activeDot={{ r: 6, fill: 'var(--color-gold-hover)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
