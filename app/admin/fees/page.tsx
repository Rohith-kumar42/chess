import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { IndianRupee, Plus, AlertTriangle } from 'lucide-react'
import { recordPayment, createFee, bulkGenerateFees } from '@/lib/actions/fees'

export default async function FeesPage({ searchParams }: { searchParams: Promise<{ action?: string, feeId?: string }> }) {
  const supabase = await createClient()
  const { action, feeId } = await searchParams;

  const { data: fees } = await supabase
    .from('fees')
    .select('*, students(full_name)')
    .order('month', { ascending: false })

  const { data: activeStudents } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name')

  const unpaidCount = fees?.filter(f => f.status !== 'paid').length ?? 0
  const showRecordPayment = action === 'record' && feeId
  const showAddFee = action === 'add'
  const showBulkGenerate = action === 'bulk'
  
  const selectedFee = showRecordPayment ? fees?.find(f => f.id === feeId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-foreground-muted mt-1">
            {fees?.length ?? 0} records · {unpaidCount} outstanding
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/fees?action=bulk"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover transition-colors"
          >
            <IndianRupee size={16} />
            Bulk Generate
          </Link>
          <Link
            href="/admin/fees?action=add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-all"
          >
            <Plus size={18} />
            Add Fee
          </Link>
        </div>
      </div>

      {/* Outstanding Warning */}
      {unpaidCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/5 border border-warning/20">
          <AlertTriangle size={20} className="text-warning flex-shrink-0" />
          <p className="text-sm text-warning">
            <strong>{unpaidCount}</strong> fee records are unpaid or partially paid.
          </p>
        </div>
      )}

      {/* Forms (Rendered conditionally based on search params) */}
      {showRecordPayment && selectedFee && (
        <div className="glass-card p-6 border-primary/20">
          <h2 className="text-lg font-semibold mb-4">Record Payment for {selectedFee.students?.full_name}</h2>
          <form action={async (formData) => {
            'use server'
            await recordPayment(selectedFee.id, formData)
          }} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-foreground-muted">Amount (Due: ₹{selectedFee.balance})</label>
              <input type="number" name="amount" defaultValue={selectedFee.balance} max={selectedFee.balance} required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-foreground-muted">Payment Method</label>
              <select name="payment_method" className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/admin/fees" className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover text-center w-full sm:w-auto">Cancel</Link>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors w-full sm:w-auto">Save</button>
            </div>
          </form>
        </div>
      )}

      {showAddFee && (
        <div className="glass-card p-6 border-primary/20">
          <h2 className="text-lg font-semibold mb-4">Add Individual Fee</h2>
          <form action={createFee} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-muted">Student</label>
              <select name="student_id" required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Select Student...</option>
                {activeStudents?.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-muted">Month</label>
              <input type="date" name="month" required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-muted">Amount Due</label>
              <input type="number" name="amount_due" required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex gap-2">
              <Link href="/admin/fees" className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover flex-1 text-center">Cancel</Link>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors flex-1">Add</button>
            </div>
          </form>
        </div>
      )}

      {showBulkGenerate && (
        <div className="glass-card p-6 border-primary/20">
          <h2 className="text-lg font-semibold mb-4">Bulk Generate Fees (All Active Students)</h2>
          <form action={bulkGenerateFees} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-foreground-muted">Month</label>
              <input type="date" name="month" required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-foreground-muted">Default Amount Due</label>
              <input type="number" name="amount_due" required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/admin/fees" className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface-hover text-center w-full sm:w-auto">Cancel</Link>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors w-full sm:w-auto">Generate</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Month</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Due</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Paid</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Balance</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {!fees || fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <IndianRupee size={40} className="mx-auto text-foreground-subtle mb-3 opacity-40" />
                    <p className="text-foreground-muted font-medium">No fee records yet</p>
                    <p className="text-sm text-foreground-subtle mt-1">Add fees for your students to start tracking</p>
                  </td>
                </tr>
              ) : (
                fees.map((fee: any) => (
                  <tr key={fee.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium">{fee.students?.full_name}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground-muted">
                      {new Date(fee.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-mono">₹{Number(fee.amount_due).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-right font-mono">₹{Number(fee.amount_paid).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-right font-mono font-medium">₹{Number(fee.balance).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                        fee.status === 'paid' ? 'bg-success/10 text-success' :
                        fee.status === 'partially_paid' ? 'bg-warning/10 text-warning' :
                        'bg-danger/10 text-danger'
                      }`}>
                        {fee.status === 'partially_paid' ? 'Partial' : fee.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {fee.status !== 'paid' && (
                        <Link
                          href={`/admin/fees?action=record&feeId=${fee.id}`}
                          className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                          Record Payment
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
