'use client'

import { CreditCard, Banknote, ArrowRightLeft, Clock } from 'lucide-react'
import type { Fee } from '@/types/app.types'

interface PaymentTimelineProps {
  fees: Fee[]
}

function paymentIcon(method: string | null) {
  switch (method?.toLowerCase()) {
    case 'card':
      return <CreditCard size={16} />
    case 'cash':
      return <Banknote size={16} />
    case 'transfer':
    case 'upi':
    case 'bank':
      return <ArrowRightLeft size={16} />
    default:
      return <Clock size={16} />
  }
}

export default function PaymentTimeline({ fees }: PaymentTimelineProps) {
  // Only show entries with a paid_date
  const paidEntries = fees
    .filter((f) => f.paid_date)
    .sort((a, b) => (b.paid_date ?? '').localeCompare(a.paid_date ?? ''))

  if (paidEntries.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Clock size={36} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted text-sm">No payments recorded yet</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3
        className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <Clock size={18} className="text-grandmaster-gold" />
        Payment History
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border-subtle" />

        <div className="space-y-4">
          {paidEntries.map((fee) => (
            <div key={fee.id} className="relative flex items-start gap-4 pl-2">
              {/* Dot */}
              <div className="w-7 h-7 rounded-full bg-grandmaster-gold/15 flex items-center justify-center text-grandmaster-gold flex-shrink-0 z-10">
                {paymentIcon(fee.payment_method)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">
                    ₹{Number(fee.amount_paid).toLocaleString('en-IN')}
                  </p>
                  <span className="text-xs text-foreground-subtle font-data">
                    {new Date(fee.paid_date! + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted mt-0.5 capitalize">
                  {fee.payment_method ?? 'Unknown method'} &middot;{' '}
                  {new Date(fee.month + 'T00:00:00').toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
