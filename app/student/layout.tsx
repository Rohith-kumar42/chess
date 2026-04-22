import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'student'
  if (role !== 'student' && role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen">
      <Sidebar role="student" userName={profile?.full_name || user.email || ''} />
      <main className="lg:pl-64 transition-all duration-300">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}
