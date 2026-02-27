'use client'

import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  CalendarCheck,
  Activity,
  MousePointerClick,
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
  },
  {
    key: 'thisWeek',
    label: 'This Week',
    icon: TrendingUp,
    size: 'medium',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-700',
    valueColor: 'text-violet-800',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle,
    size: 'small',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    valueColor: 'text-emerald-800',
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

export default function StatsCards({ stats, loading, showLinkAnalytics = false }) {
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
    thisWeek: 'bg-violet-50 border-violet-200',
    completed: 'bg-emerald-50 border-emerald-200',
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

      {/* Status cards: Total, Confirmed, This Week, Completed, Cancelled */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cardConfig
          .filter((c) => c.size === 'medium' || c.size === 'small')
          .map(({ key, label, icon: Icon, iconBg, iconColor, valueColor }) => (
            <div
              key={key}
              className={`rounded-xl border-2 p-3.5 hover:shadow transition-all ${statusCardBg[key] || 'bg-white border-slate-200'}`}
            >
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
            </div>
          ))}
      </div>

      {/* Link click counts — only for Karl Legson */}
      {showLinkAnalytics && stats?.linkClicks && typeof stats.linkClicks === 'object' && (
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-4 mt-4">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-slate-500" />
            Link / button clicks
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pricing — Request appointment</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.linkClicks['pricing-request-appointment'] ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pricing — Back to home</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.linkClicks['pricing-back-to-home'] ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Google Business profile</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.linkClicks['google-business'] ?? 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
