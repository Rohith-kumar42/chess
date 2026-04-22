'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createStudent, updateStudent } from '@/lib/actions/students'
import type { Student } from '@/types/app.types'

interface StudentFormProps {
  student?: Student
}

export default function StudentForm({ student }: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!student

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      if (isEdit) {
        await updateStudent(student.id, formData)
      } else {
        await createStudent(formData)
      }
      router.push('/admin/students')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-sm"
  const labelClasses = "block text-sm font-medium text-foreground-muted mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Student Info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-5">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label htmlFor="full_name" className={labelClasses}>Full Name *</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              defaultValue={student?.full_name ?? ''}
              placeholder="Enter student's full name"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="date_of_birth" className={labelClasses}>Date of Birth</label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={student?.date_of_birth ?? ''}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="school" className={labelClasses}>School</label>
            <input
              id="school"
              name="school"
              type="text"
              defaultValue={student?.school ?? ''}
              placeholder="School name"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="skill_level" className={labelClasses}>Skill Level</label>
            <select
              id="skill_level"
              name="skill_level"
              defaultValue={student?.skill_level ?? ''}
              className={inputClasses}
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="competitive">Competitive</option>
            </select>
          </div>
          <div>
            <label htmlFor="chess_rating" className={labelClasses}>Chess Rating</label>
            <input
              id="chess_rating"
              name="chess_rating"
              type="number"
              defaultValue={student?.chess_rating ?? ''}
              placeholder="e.g., 1200"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Parent Info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-5">Parent / Guardian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label htmlFor="parent_name" className={labelClasses}>Parent Name</label>
            <input
              id="parent_name"
              name="parent_name"
              type="text"
              defaultValue={student?.parent_name ?? ''}
              placeholder="Parent or guardian name"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="parent_email" className={labelClasses}>Parent Email</label>
            <input
              id="parent_email"
              name="parent_email"
              type="email"
              defaultValue={student?.parent_email ?? ''}
              placeholder="parent@example.com"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="parent_phone" className={labelClasses}>Parent Phone</label>
            <input
              id="parent_phone"
              name="parent_phone"
              type="tel"
              defaultValue={student?.parent_phone ?? ''}
              placeholder="+91 98765 43210"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-5">Notes</h2>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={student?.notes ?? ''}
          placeholder="Any additional notes about the student..."
          className={inputClasses + ' resize-none'}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Student' : 'Add Student'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg bg-surface border border-border text-foreground-muted font-medium text-sm hover:bg-surface-hover transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
