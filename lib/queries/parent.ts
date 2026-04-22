
import { createClient } from '@/lib/supabase/server'

export async function getParentDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get children (students) for this parent
  const { data: children } = await supabase
    .from('students')
    .select('*, fees(*), progress_entries(*)')
    .eq('parent_id', user.id)
    .order('full_name')

  if (!children) return null

  return {
    children
  }
}
