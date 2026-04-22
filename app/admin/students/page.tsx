import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import StudentsTable from '@/components/students/StudentsTable'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('full_name')

  const activeStudents = students?.filter(s => s.is_active) ?? []
  const inactiveStudents = students?.filter(s => !s.is_active) ?? []

  const skillLevelColors: Record<string, string> = {
    beginner: 'bg-bishop-slate/10 text-bishop-slate',
    intermediate: 'bg-gold-muted/10 text-gold-muted',
    advanced: 'bg-grandmaster-gold/10 text-grandmaster-gold',
    competitive: 'bg-rook-copper/10 text-rook-copper',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight text-ivory"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Students
          </h1>
          <p className="text-parchment mt-1">
            {activeStudents.length} active · {inactiveStudents.length} archived
          </p>
        </div>
        <Link
          href="/admin/students/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-grandmaster-gold text-obsidian font-semibold text-sm hover:bg-gold-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Student
        </Link>
      </div>

      {/* Table */}
      <StudentsTable
        students={activeStudents}
        skillLevelColors={skillLevelColors}
      />
    </div>
  )
}
