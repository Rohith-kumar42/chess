import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFeesForParent } from '@/lib/actions/fees'
import FeesPageClient from '@/components/fees/FeesPageClient'

export default async function ParentFeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const groups = await getFeesForParent(user.id)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Fee History
        </h1>
        <p className="text-foreground-muted mt-1">View invoices and payment history</p>
      </div>

      <FeesPageClient groups={groups} />
    </div>
  )
}
