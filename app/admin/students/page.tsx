import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, Filter, Users } from 'lucide-react'
import { calculateAge } from '@/lib/utils'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('full_name')

  const activeStudents = students?.filter(s => s.is_active) ?? []
  const inactiveStudents = students?.filter(s => !s.is_active) ?? []

  const skillLevelColors: Record<string, string> = {
    beginner: 'bg-info/10 text-info',
    intermediate: 'bg-warning/10 text-warning',
    advanced: 'bg-accent/10 text-accent',
    competitive: 'bg-primary/10 text-primary',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-foreground-muted mt-1">
            {activeStudents.length} active · {inactiveStudents.length} archived
          </p>
        </div>
        <Link
          href="/admin/students/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Student
        </Link>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">Age</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Level</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden md:table-cell">Rating</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">Parent</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {activeStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="text-foreground-subtle">
                      <Users className="mx-auto mb-3 opacity-40" size={40} />
                      <p className="text-foreground-muted font-medium">No students yet</p>
                      <p className="text-sm mt-1">Add your first student to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/students/${student.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {student.full_name}
                      </Link>
                      {student.school && (
                        <p className="text-xs text-foreground-subtle mt-0.5">{student.school}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground-muted hidden sm:table-cell">{calculateAge(student.date_of_birth) ?? '–'}</td>
                    <td className="px-5 py-3.5">
                      {student.skill_level ? (
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium capitalize ${skillLevelColors[student.skill_level] ?? 'bg-surface text-foreground-muted'}`}>
                          {student.skill_level}
                        </span>
                      ) : (
                        <span className="text-sm text-foreground-subtle">–</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground-muted hidden md:table-cell font-mono">
                      {student.chess_rating ?? '–'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground-muted hidden lg:table-cell">
                      {student.parent_name ?? '–'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                        student.is_active ? 'bg-success/10 text-success' : 'bg-foreground-subtle/10 text-foreground-subtle'
                      }`}>
                        {student.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/students/${student.id}/edit`}
                        className="text-xs text-foreground-muted hover:text-primary transition-colors font-medium"
                      >
                        Edit
                      </Link>
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
