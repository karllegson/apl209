'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/appointments',
    label: 'All Appointments',
    icon: CalendarDays,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700/50">
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

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-apl-blue text-white'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700/50">
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
        className={`md:hidden fixed inset-y-0 left-0 w-64 bg-slate-800 z-40 transform transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen bg-slate-800">
        <SidebarContent />
      </aside>
    </>
  )
}
