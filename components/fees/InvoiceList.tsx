'use client'

import { ArrowUpDown, Download } from 'lucide-react'
import type { Fee } from '@/types/app.types'
import { useState } from 'react'

interface InvoiceListProps {
  fees: Fee[]
  onDownloadInvoice?: (fee: Fee) => void
}

type SortField = 'month' | 'amount_due' | 'balance' | 'status'
type SortDir = 'asc' | 'desc'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    paid: 'bg-grandmaster-gold/15 text-grandmaster-gold',
    partially_paid: 'bg-rook-copper/15 text-rook-copper',
    unpaid: 'bg-danger/15 text-danger',
  }
  const label: Record<string, string> = {
    paid: 'Paid',
    partially_paid: 'Partial',
    unpaid: 'Unpaid',
  }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${map[status] ?? 'bg-surface-hover text-foreground-muted'}`}>
      {label[status] ?? status}
    </span>
  )
}

export default function InvoiceList({ fees, onDownloadInvoice }: InvoiceListProps) {
  const [sortField, setSortField] = useState<SortField>('month')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sorted = [...fees].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1
    switch (sortField) {
      case 'month':
        return mult * a.month.localeCompare(b.month)
      case 'amount_due':
        return mult * (Number(a.amount_due) - Number(b.amount_due))
      case 'balance':
        return mult * (Number(a.balance) - Number(b.balance))
      case 'status':
        return mult * a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  if (fees.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-foreground-muted">No fee records found</p>
      </div>
    )
  }

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown size={14} className={sortField === field ? 'text-grandmaster-gold' : 'opacity-40'} />
    </button>
  )

  return (
    <div className="glass-card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left p-4"><SortHeader field="month" label="Month" /></th>
              <th className="text-right p-4"><SortHeader field="amount_due" label="Amount Due" /></th>
              <th className="text-right p-4">Amount Paid</th>
              <th className="text-right p-4"><SortHeader field="balance" label="Balance" /></th>
              <th className="text-center p-4"><SortHeader field="status" label="Status" /></th>
              <th className="text-center p-4">Method</th>
              {onDownloadInvoice && <th className="text-center p-4">Invoice</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((fee, idx) => (
              <tr
                key={fee.id}
                className={`border-b border-border-subtle/50 transition-colors hover:bg-surface-hover ${
                  idx % 2 === 0 ? 'bg-transparent' : 'bg-surface-raised/30'
                }`}
              >
                <td className="p-4 font-data">
                  {new Date(fee.month + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </td>
                <td className="p-4 text-right font-data">₹{Number(fee.amount_due).toLocaleString('en-IN')}</td>
                <td className="p-4 text-right font-data">₹{Number(fee.amount_paid).toLocaleString('en-IN')}</td>
                <td className="p-4 text-right font-data font-medium">₹{Number(fee.balance).toLocaleString('en-IN')}</td>
                <td className="p-4 text-center">{statusBadge(fee.status)}</td>
                <td className="p-4 text-center text-foreground-muted capitalize">{fee.payment_method ?? '—'}</td>
                {onDownloadInvoice && (
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onDownloadInvoice(fee)}
                      className="p-2 rounded-lg hover:bg-grandmaster-gold/10 text-grandmaster-gold transition-colors"
                      title="Download Invoice"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border-subtle/50">
        {sorted.map((fee) => (
          <div key={fee.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium font-data">
                {new Date(fee.month + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              {statusBadge(fee.status)}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-foreground-subtle text-xs">Due</p>
                <p className="font-data">₹{Number(fee.amount_due).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs">Paid</p>
                <p className="font-data">₹{Number(fee.amount_paid).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs">Balance</p>
                <p className="font-data font-medium">₹{Number(fee.balance).toLocaleString('en-IN')}</p>
              </div>
            </div>
            {onDownloadInvoice && (
              <button
                onClick={() => onDownloadInvoice(fee)}
                className="flex items-center gap-1.5 text-xs text-grandmaster-gold hover:underline"
              >
                <Download size={14} /> Download Invoice
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
