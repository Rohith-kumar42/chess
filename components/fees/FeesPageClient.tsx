'use client'

import { useState, useMemo, useCallback } from 'react'
import { Users, Filter, IndianRupee } from 'lucide-react'
import type { Fee } from '@/types/app.types'
import type { StudentFeeGroup } from '@/lib/actions/fees'
import BalanceSummaryCard from '@/components/fees/BalanceSummaryCard'
import InvoiceList from '@/components/fees/InvoiceList'
import PaymentTimeline from '@/components/fees/PaymentTimeline'
import { generateInvoicePDF } from '@/components/fees/InvoicePDF'
import { AnimatedSection } from '@/components/shared/AnimatedContainers'

interface FeesPageClientProps {
  groups: StudentFeeGroup[]
}

type StatusFilter = 'all' | 'paid' | 'partially_paid' | 'unpaid'

export default function FeesPageClient({ groups }: FeesPageClientProps) {
  const [activeChild, setActiveChild] = useState(0)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const activeGroup = groups[activeChild]
  const allFees = activeGroup?.fees ?? []

  // Client-side filtering
  const filteredFees = useMemo(() => {
    let result = allFees

    if (statusFilter !== 'all') {
      result = result.filter((f) => f.status === statusFilter)
    }

    if (dateFrom) {
      result = result.filter((f) => f.month >= dateFrom)
    }

    if (dateTo) {
      result = result.filter((f) => f.month <= dateTo)
    }

    return result
  }, [allFees, statusFilter, dateFrom, dateTo])

  const handleDownloadInvoice = useCallback(
    async (fee: Fee) => {
      try {
        const studentName = activeGroup?.student.full_name ?? 'Student'
        const blob = await generateInvoicePDF(fee, studentName)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${studentName.replace(/\s+/g, '_')}-${fee.month}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Failed to generate invoice PDF', err)
      }
    },
    [activeGroup]
  )

  if (groups.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <IndianRupee size={48} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
        <p className="text-foreground-muted">No children linked to your account</p>
        <p className="text-foreground-subtle text-xs mt-1">Contact the academy to link your child&apos;s profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Child Switcher — only if multiple children */}
      {groups.length > 1 && (
        <AnimatedSection>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Users size={18} className="text-foreground-muted flex-shrink-0" />
            {groups.map((g, idx) => (
              <button
                key={g.student.id}
                onClick={() => {
                  setActiveChild(idx)
                  setStatusFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  idx === activeChild
                    ? 'bg-grandmaster-gold text-primary-foreground'
                    : 'bg-surface-raised text-foreground-muted hover:bg-surface-hover'
                }`}
              >
                {g.student.full_name}
              </button>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Balance Summary */}
      <AnimatedSection delay={0.1}>
        <BalanceSummaryCard fees={allFees} />
      </AnimatedSection>

      {/* Filter Controls */}
      <AnimatedSection delay={0.2}>
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-foreground-muted">
              <Filter size={16} />
              <span className="text-sm font-medium">Filters</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-surface-raised border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-grandmaster-gold/30"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-foreground-subtle">From</label>
              <input
                type="month"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value ? e.target.value + '-01' : '')}
                className="bg-surface-raised border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-grandmaster-gold/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-foreground-subtle">To</label>
              <input
                type="month"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value ? e.target.value + '-01' : '')}
                className="bg-surface-raised border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-grandmaster-gold/30"
              />
            </div>

            {(statusFilter !== 'all' || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
                className="text-xs text-rook-copper hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Invoice List */}
      <AnimatedSection delay={0.3}>
        <InvoiceList fees={filteredFees} onDownloadInvoice={handleDownloadInvoice} />
      </AnimatedSection>

      {/* Payment Timeline */}
      <AnimatedSection delay={0.4}>
        <PaymentTimeline fees={allFees} />
      </AnimatedSection>
    </div>
  )
}
