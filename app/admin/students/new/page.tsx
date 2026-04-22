import StudentForm from '@/components/students/StudentForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewStudentPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/students"
          className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-foreground-muted text-sm mt-0.5">Enter the student details below</p>
        </div>
      </div>
      <StudentForm />
    </div>
  )
}
