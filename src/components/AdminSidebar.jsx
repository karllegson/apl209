'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  BarChart2,
  Phone,
  LogOut,
  Menu,
  X,
  User,
  PawPrint,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tnr', label: 'TNR', icon: PawPrint },
  { href: '/admin/attempted', label: 'Attempted', icon: Phone },
  { href: '/admin/confirmed', label: 'Confirmed', icon: CalendarCheck },
  { href: '/admin/appointments', label: 'All Appointments', icon: CalendarDays },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [staffName, setStaffName] = useState(null)

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.staffName && setStaffName(data.staffName))
      .catch(() => {})
  }, [])

  const SidebarContent = () => (
    <div className="flex flex-col h-full min-h-0">
      {/* Logo — fixed at top */}
      <div className="shrink-0 p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="APL" width={36} height={36} className="object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">APL Clinic</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation — scrolls if needed */}
      <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-apl-primary text-white'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Signed-in user + Logout — fixed at bottom */}
      <div className="shrink-0 p-3 border-t border-slate-700/50 space-y-1">
        {staffName && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/40">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-300 truncate" title={staffName}>
              {staffName}
            </span>
          </div>
        )}
        <a
          href="/api/admin/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 w-full transition-all"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </a>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-lg cursor-pointer"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-64 h-screen bg-slate-800 z-40 transform transition-transform flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Desktop — fixed, always visible */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:flex-col md:w-64 md:h-screen md:max-h-screen bg-slate-800 z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
