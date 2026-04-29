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
  Bell,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { KnightIcon } from '@/components/icons/ChessPieces'
import ThemeToggle from '@/components/shared/ThemeToggle'

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
  const [unreadCount, setUnreadCount] = useState(0)

  const navItems = role === 'admin' ? adminNav : role === 'parent' ? parentNav : studentNav

  // Fetch unread notification count for admin users
  const fetchUnreadCount = useCallback(async () => {
    if (role !== 'admin') return
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      setUnreadCount(count ?? 0)
    } catch {
      // notifications table may not exist yet
    }
  }, [role, supabase])

  useEffect(() => {
    fetchUnreadCount()
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

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
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-surface-raised border border-border hover:bg-surface-hover transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-foreground" />
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
          fixed top-0 left-0 h-full z-50 bg-sidebar border-r border-border/20
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-border/20 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <KnightIcon size={18} className="text-accent" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2
                className="text-sm font-bold tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Chess Academy
              </h2>
              <p className="text-[10px] font-medium uppercase tracking-wider text-accent">{roleLabel}</p>
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
                        ? 'bg-sidebar-active text-foreground font-medium shadow-sm'
                        : 'text-foreground-muted hover:bg-sidebar-hover hover:text-foreground'
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
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent"
                      />
                    )}
                    <span className={`flex-shrink-0 ${isActive ? 'text-accent' : ''}`}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Admin Notification Bell */}
          {role === 'admin' && (
            <div className="mt-4 px-1">
              <Link
                href="/admin/dashboard"
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-150 relative
                  ${collapsed ? 'justify-center' : ''}
                  text-foreground-muted hover:bg-sidebar-hover hover:text-foreground
                `}
                title={collapsed ? `Notifications (${unreadCount})` : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex-shrink-0 relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rook-copper text-white text-[10px] font-bold font-data px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <span className="truncate">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-1.5 text-xs text-rook-copper">({unreadCount})</span>
                    )}
                  </span>
                )}
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/20 p-2 space-y-1">
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-foreground-muted hover:bg-sidebar-hover hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* User info */}
          {!collapsed && userName && (
            <div className="px-3 py-1.5">
              <p className="text-xs text-foreground-subtle truncate">{userName}</p>
            </div>
          )}

          {/* Theme Toggle */}
          <div className={`px-3 py-1.5 flex items-center gap-3 text-sm text-foreground-muted ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && <span>Appearance</span>}
            <ThemeToggle />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-foreground-muted hover:bg-rook-copper/10 hover:text-rook-copper transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
