'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  TrendingUp,
  Calendar,
  Video,
  Trophy,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { KnightIcon } from '@/components/icons/ChessPieces'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  role: 'admin' | 'student' | 'parent'
  userName?: string
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Students', href: '/admin/students', icon: <Users size={20} /> },
  { label: 'Fees', href: '/admin/fees', icon: <IndianRupee size={20} /> },
  { label: 'Progress', href: '/admin/progress', icon: <TrendingUp size={20} /> },
  { label: 'Schedule', href: '/admin/schedule', icon: <Calendar size={20} /> },
  { label: 'Recordings', href: '/admin/recordings', icon: <Video size={20} /> },
  { label: 'Tournaments', href: '/admin/tournaments', icon: <Trophy size={20} /> },
]

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'My Progress', href: '/student/progress', icon: <TrendingUp size={20} /> },
  { label: 'Schedule', href: '/student/schedule', icon: <Calendar size={20} /> },
  { label: 'Recordings', href: '/student/recordings', icon: <Video size={20} /> },
  { label: 'Tournaments', href: '/student/tournaments', icon: <Trophy size={20} /> },
]

const parentNav: NavItem[] = [
  { label: 'Dashboard', href: '/parent/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Fees', href: '/parent/fees', icon: <IndianRupee size={20} /> },
  { label: 'Progress', href: '/parent/progress', icon: <TrendingUp size={20} /> },
]

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = role === 'admin' ? adminNav : role === 'parent' ? parentNav : studentNav

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'parent' ? 'Parent' : 'Student'

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-board-dark border border-board-light hover:bg-board-mid transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-ivory" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-obsidian border-r border-board-light/20
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-board-light/20 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-grandmaster-gold/10 border border-grandmaster-gold/20 flex items-center justify-center">
            <KnightIcon size={18} className="text-grandmaster-gold" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2
                className="text-sm font-bold tracking-tight text-ivory"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Chess Academy
              </h2>
              <p className="text-[10px] font-medium uppercase tracking-wider text-grandmaster-gold">{roleLabel}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                      transition-all duration-150 relative
                      ${collapsed ? 'justify-center' : ''}
                      ${isActive
                        ? 'bg-board-mid text-ivory font-medium'
                        : 'text-parchment hover:bg-board-dark hover:text-ivory'
                      }
                    `}
                    style={{
                      letterSpacing: '0.02em',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Active indicator — left accent bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-grandmaster-gold"
                      />
                    )}
                    <span className={`flex-shrink-0 ${isActive ? 'text-grandmaster-gold' : ''}`}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-board-light/20 p-2 space-y-1">
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-parchment hover:bg-board-dark hover:text-ivory transition-colors"
          >
            <ChevronLeft size={20} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* User info */}
          {!collapsed && userName && (
            <div className="px-3 py-1.5">
              <p className="text-xs text-dust truncate">{userName}</p>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-parchment hover:bg-rook-copper/10 hover:text-rook-copper transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
