'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ExternalLink, Users } from 'lucide-react'
import RatingSparkline from './RatingSparkline'
import AttendanceIndicator from './AttendanceIndicator'
import StudentQuickView from './StudentQuickView'

// Deterministic mock generators based on student ID
function generateTrendData(id: string): number[] {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  const base = 800 + Math.abs(hash % 1200)
  return Array.from({ length: 7 }, (_, i) => {
    const seed = Math.abs((hash * (i + 1) * 31) % 100)
    return base + (seed - 50) * 3
  })
}

function generateAttendanceData(id: string): boolean[] {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 3) + id.charCodeAt(i)) | 0
  }
  return Array.from({ length: 5 }, (_, i) => {
    return Math.abs((hash * (i + 7)) % 10) > 2
  })
}

type SortField = 'full_name' | 'chess_rating' | 'attendance'
type SortDir = 'asc' | 'desc'

interface StudentsTableProps {
  students: any[]
  skillLevelColors: Record<string, string>
}

export default function StudentsTable({ students, skillLevelColors }: StudentsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [quickViewStudent, setQuickViewStudent] = useState<any>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null
    return (
      <span className="text-grandmaster-gold ml-1">
        {sortDir === 'asc' ? '▲' : '▼'}
      </span>
    )
  }

  const enrichedStudents = useMemo(() => {
    return students.map((s) => ({
      ...s,
      trendData: generateTrendData(s.id),
      attendanceData: generateAttendanceData(s.id),
    }))
  }, [students])

  const sortedStudents = useMemo(() => {
    if (!sortField) return enrichedStudents
    return [...enrichedStudents].sort((a, b) => {
      let cmp = 0
      if (sortField === 'full_name') {
        cmp = (a.full_name || '').localeCompare(b.full_name || '')
      } else if (sortField === 'chess_rating') {
        cmp = (a.chess_rating ?? 0) - (b.chess_rating ?? 0)
      } else if (sortField === 'attendance') {
        const aCount = a.attendanceData.filter(Boolean).length
        const bCount = b.attendanceData.filter(Boolean).length
        cmp = aCount - bCount
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [enrichedStudents, sortField, sortDir])

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-board-light/20">
                <th
                  className="text-left px-5 py-3 text-xs font-semibold text-parchment uppercase tracking-wider cursor-pointer hover:text-ivory transition-colors select-none"
                  onClick={() => handleSort('full_name')}
                >
                  Name {sortIndicator('full_name')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-parchment uppercase tracking-wider hidden sm:table-cell">
                  Level
                </th>
                <th
                  className="text-left px-5 py-3 text-xs font-semibold text-parchment uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-ivory transition-colors select-none"
                  onClick={() => handleSort('chess_rating')}
                >
                  Rating {sortIndicator('chess_rating')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-parchment uppercase tracking-wider hidden md:table-cell">
                  Trend
                </th>
                <th
                  className="text-left px-5 py-3 text-xs font-semibold text-parchment uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-ivory transition-colors select-none"
                  onClick={() => handleSort('attendance')}
                >
                  Attendance {sortIndicator('attendance')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-parchment uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-parchment uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-board-light/10">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="text-dust">
                      <Users className="mx-auto mb-3 opacity-40" size={40} />
                      <p className="text-parchment font-medium">No students yet</p>
                      <p className="text-sm mt-1">Add your first student to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-board-dark/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="font-medium text-sm text-ivory hover:text-grandmaster-gold transition-colors"
                      >
                        {student.full_name}
                      </Link>
                      {student.school && (
                        <p className="text-xs text-dust mt-0.5">{student.school}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {student.skill_level ? (
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium capitalize ${skillLevelColors[student.skill_level] ?? 'bg-board-mid text-parchment'}`}>
                          {student.skill_level}
                        </span>
                      ) : (
                        <span className="text-sm text-dust">–</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ivory hidden md:table-cell font-data">
                      {student.chess_rating ?? '–'}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <RatingSparkline data={student.trendData} />
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <AttendanceIndicator attended={student.attendanceData} />
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                        student.is_active ? 'bg-grandmaster-gold/10 text-grandmaster-gold' : 'bg-dust/10 text-dust'
                      }`}>
                        {student.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setQuickViewStudent(student)}
                        className="p-1.5 rounded-lg text-parchment hover:text-grandmaster-gold hover:bg-board-dark transition-colors"
                        title="Quick view"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Drawer */}
      {quickViewStudent && (
        <StudentQuickView
          student={quickViewStudent}
          trendData={quickViewStudent.trendData}
          attendanceData={quickViewStudent.attendanceData}
          onClose={() => setQuickViewStudent(null)}
        />
      )}
    </>
  )
}
