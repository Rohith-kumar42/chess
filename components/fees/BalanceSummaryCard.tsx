'use client'

import { IndianRupee, TrendingDown, CheckCircle } from 'lucide-react'
import type { Fee } from '@/types/app.types'

interface BalanceSummaryCardProps {
  fees: Fee[]
}

export default function BalanceSummaryCard({ fees }: BalanceSummaryCardProps) {
  const totalDue = fees.reduce((sum, f) => sum + Number(f.amount_due), 0)
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.amount_paid), 0)
  const outstanding = totalDue - totalPaid

  const cards = [
    {
      label: 'Total Due',
      value: totalDue,
      icon: <IndianRupee size={20} />,
      accentClass: 'text-foreground-muted',
      bgClass: 'bg-foreground-subtle/10',
    },
    {
      label: 'Total Paid',
      value: totalPaid,
      icon: <CheckCircle size={20} />,
      accentClass: 'text-grandmaster-gold',
      bgClass: 'bg-grandmaster-gold/10',
    },
    {
      label: 'Outstanding',
      value: outstanding,
      icon: <TrendingDown size={20} />,
      accentClass: outstanding > 0 ? 'text-rook-copper' : 'text-grandmaster-gold',
      bgClass: outstanding > 0 ? 'bg-rook-copper/10' : 'bg-grandmaster-gold/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card p-5 hover:scale-[1.02] transition-transform duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-foreground-muted font-medium">{card.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground font-data">
                ₹{card.value.toLocaleString('en-IN')}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${card.bgClass} ${card.accentClass}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
