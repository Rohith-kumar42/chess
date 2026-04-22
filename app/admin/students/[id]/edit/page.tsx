import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import StudentForm from '@/components/students/StudentForm'

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/students/${id}`}
          className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-foreground-muted text-sm mt-0.5">{student.full_name}</p>
        </div>
      </div>
      <StudentForm student={student} />
    </div>
  )
}
