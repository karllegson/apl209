'use client'

import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

const NO_SIDEBAR_PATHS = ['/admin', '/admin/who']

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const showSidebar = pathname && !NO_SIDEBAR_PATHS.includes(pathname)

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 min-h-screen md:pl-64">
        {children}
      </main>
    </div>
  )
}
