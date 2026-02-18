'use client'

import Link from 'next/link'
import {
  CalendarDays,
  Clock,
  XCircle,
  CalendarCheck,
  Activity,
  Phone,
} from 'lucide-react'

const cardConfig = [
  {
    key: 'total',
    label: 'Total',
    icon: CalendarDays,
    size: 'small',
    iconBg: 'bg-apl-blue/15',
    iconColor: 'text-apl-blue-dark',
    valueColor: 'text-apl-blue-dark',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: Clock,
    size: 'large',
    valueColor: 'text-amber-800',
    description: 'Awaiting confirmation',
  },
  {
    key: 'today',
    label: "Today's",
    icon: Activity,
    size: 'large',
    valueColor: 'text-apl-orange-dark',
    description: 'Submitted today',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: CalendarCheck,
    size: 'medium',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    valueColor: 'text-sky-800',
    href: '/admin/confirmed',
  },
  {
    key: 'standby',
    label: 'Attempted',
    icon: Phone,
    size: 'medium',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-700',
    valueColor: 'text-violet-800',
    href: '/admin/attempted',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    size: 'small',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    valueColor: 'text-rose-700',
  },
]

export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const statusCardBg = {
    total: 'bg-apl-blue/5 border-apl-blue/25',
    confirmed: 'bg-sky-50 border-sky-200',
    standby: 'bg-violet-50 border-violet-200',
    cancelled: 'bg-rose-50 border-rose-200',
  }

  const monthRange = (() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  })()

  return (
    <div className="space-y-4">
      {/* Month + Stats row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-lg md:text-xl font-bold text-slate-700">
          {monthRange}
        </p>
      </div>

      {/* Action cards: Pending & Today */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cardConfig
          .filter((c) => c.size === 'large')
          .map(({ key, label, icon: Icon, valueColor, description }) => {
            const pendingStyles = 'bg-amber-50/90 border-2 border-amber-200'
            const todayStyles = 'bg-apl-orange/10 border-2 border-apl-orange/30'
            return (
              <div
                key={key}
                className={`rounded-xl p-5 hover:shadow-md transition-shadow ${key === 'pending' ? pendingStyles : todayStyles}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{stats?.[key] ?? 0}</p>
                    {description && (
                      <p className="text-xs text-slate-600 mt-1">{description}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${key === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-apl-orange/25 text-apl-orange-dark'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Status cards: Total, Confirmed, Attempted, Cancelled */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cardConfig
          .filter((c) => c.size === 'medium' || c.size === 'small')
          .map(({ key, label, icon: Icon, iconBg, iconColor, valueColor, href }) => {
            const cardClass = `rounded-xl border-2 p-3.5 transition-all ${statusCardBg[key] || 'bg-white border-slate-200'} ${href ? 'hover:shadow cursor-pointer hover:border-slate-300' : ''}`
            const content = (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-slate-600 truncate uppercase tracking-wide">
                    {label}
                  </p>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className={`text-xl font-bold mt-1 ${valueColor}`}>
                  {stats?.[key] ?? 0}
                </p>
              </>
            )
            if (href) {
              return (
                <Link key={key} href={href} className={cardClass}>
                  {content}
                </Link>
              )
            }
            return (
              <div key={key} className={cardClass}>
                {content}
              </div>
            )
          })}
      </div>
    </div>
  )
}
