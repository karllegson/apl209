'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock3, Hourglass, Sparkles } from 'lucide-react'
import { useLanguage } from '@/components/intake/LanguageContext'

export default function VolunteerStats({ refreshKey = 0 }) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/volunteer/stats')
        const data = await res.json()
        if (!res.ok) return
        if (!cancelled) setStats(data.stats || null)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  if (!stats) return null

  const items = [
    {
      label: isSpanish ? 'Este mes' : 'This month',
      value: stats.days_this_month,
      suffix: isSpanish ? 'd' : 'd',
      Icon: CalendarDays,
    },
    {
      label: isSpanish ? 'Horas mes' : 'Hours',
      value: stats.hours_this_month,
      suffix: '',
      Icon: Clock3,
    },
    {
      label: isSpanish ? 'Próximos' : 'Upcoming',
      value: stats.days_upcoming,
      suffix: '',
      Icon: Hourglass,
    },
    {
      label: isSpanish ? 'Total hrs' : 'Total hrs',
      value: stats.hours_total,
      suffix: '',
      Icon: Sparkles,
    },
  ]

  return (
    <section className="rounded-2xl border border-apl-primary/15 bg-gradient-to-br from-white via-apl-blue-50/40 to-amber-50/30 px-3 py-3 sm:px-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-apl-primary/70 mb-2.5">
        {isSpanish ? 'Tu tiempo' : 'Your time'}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div key={item.label} className="text-center min-w-0 rounded-xl bg-white/70 py-2 px-1">
            <item.Icon className="w-3.5 h-3.5 mx-auto text-apl-primary/70 mb-1" />
            <p className="text-lg sm:text-xl font-bold tabular-nums text-gray-900 tracking-tight">
              {item.value}
              {item.suffix}
            </p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
