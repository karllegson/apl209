'use client'

import {
  BarChart2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Users,
  XCircle,
} from 'lucide-react'
import { formatHourLabel } from '@/lib/analytics/intakeAnalytics'

function StatCard({ label, value, hint, icon: Icon, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-800',
    blue: 'border-apl-blue/20 bg-apl-blue/5 text-apl-blue-dark',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    rose: 'border-rose-200 bg-rose-50 text-rose-800',
    violet: 'border-violet-200 bg-violet-50 text-violet-800',
  }

  const iconTones = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-apl-blue/15 text-apl-blue-dark',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    violet: 'bg-violet-100 text-violet-700',
  }

  return (
    <div className={`rounded-xl border-2 p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconTones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function BarRow({ label, count, max, suffix = '' }) {
  const width = max > 0 ? Math.max(6, Math.round((count / max) * 100)) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-700 truncate">{label}</span>
        <span className="font-semibold text-slate-800 shrink-0">
          {count}
          {suffix}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-apl-primary transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function HourChart({ byHour }) {
  const max = Math.max(...byHour.map((item) => item.count), 1)

  return (
    <div className="flex items-end gap-1 h-40">
      {byHour.map(({ hour, count }) => {
        const height = max > 0 ? Math.max(8, Math.round((count / max) * 100)) : 8
        const isPeak = count === max && count > 0
        return (
          <div key={hour} className="flex-1 min-w-0 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center h-28">
              <div
                title={`${formatHourLabel(hour)}: ${count}`}
                className={`w-full max-w-4 rounded-t-md ${isPeak ? 'bg-apl-primary' : 'bg-apl-primary/35'}`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500">{hour % 6 === 0 ? formatHourLabel(hour) : ''}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function IntakeAnalyticsDashboard({ analytics }) {
  if (!analytics) return null

  const { statusCounts, howHeard, timing, locations } = analytics
  const categoryMax = Math.max(...howHeard.categories.map((item) => item.count), 1)
  const cityMax = Math.max(...locations.cities.map((item) => item.count), 1)
  const zipMax = Math.max(...locations.zips.map((item) => item.count), 1)
  const dayMax = Math.max(...timing.byDay.map((item) => item.count), 1)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total intakes"
          value={statusCounts.total}
          hint="All submissions through the intake form"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Completed"
          value={statusCounts.completed}
          hint="Marked completed in admin"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Cancelled"
          value={statusCounts.cancelled}
          hint="Cancelled submissions"
          icon={XCircle}
          tone="rose"
        />
        <StatCard
          label="Still active"
          value={statusCounts.pending + statusCounts.confirmed}
          hint={`${statusCounts.pending} pending · ${statusCounts.confirmed} confirmed`}
          icon={CalendarCheck}
          tone="amber"
        />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: statusCounts.pending },
          { label: 'Confirmed', value: statusCounts.confirmed },
          { label: 'Attempted', value: statusCounts.attempted },
          { label: 'TNR', value: statusCounts.tnr },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border-2 border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-apl-primary" />
            <div>
              <h2 className="text-base font-bold text-slate-800">How they found us</h2>
              <p className="text-sm text-slate-500">Summarized from the optional “How did you hear about us?” field</p>
            </div>
          </div>
          <div className="space-y-4">
            {howHeard.categories.map((item) => (
              <div key={item.label}>
                <BarRow label={item.label} count={item.count} max={categoryMax} suffix={` · ${item.percent}%`} />
                {item.examples.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    e.g. {item.examples.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
          {howHeard.topAnswers.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Top exact answers</p>
              <div className="flex flex-wrap gap-2">
                {howHeard.topAnswers.map(({ label, count }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-slate-500">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border-2 border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="w-4 h-4 text-apl-primary" />
            <div>
              <h2 className="text-base font-bold text-slate-800">When intakes come in</h2>
              <p className="text-sm text-slate-500">Pacific time, based on submission time</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Busiest hour</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{timing.peakHour.label}</p>
              <p className="text-xs text-slate-600">{timing.peakHour.count} submissions</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Busiest day</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{timing.peakDay.label}</p>
              <p className="text-xs text-slate-600">{timing.peakDay.count} submissions</p>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">By hour</p>
          <HourChart byHour={timing.byHour} />

          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">By day of week</p>
            <div className="space-y-3">
              {timing.byDay.map((item) => (
                <BarRow key={item.day} label={item.label} count={item.count} max={dayMax} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border-2 border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-apl-primary" />
            <div>
              <h2 className="text-base font-bold text-slate-800">Top cities</h2>
              <p className="text-sm text-slate-500">Where customers said they live</p>
            </div>
          </div>
          <div className="space-y-3">
            {locations.cities.length > 0 ? (
              locations.cities.map((item) => (
                <BarRow key={item.label} label={item.label} count={item.count} max={cityMax} />
              ))
            ) : (
              <p className="text-sm text-slate-500">No city data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border-2 border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-apl-primary" />
            <div>
              <h2 className="text-base font-bold text-slate-800">Top ZIP codes</h2>
              <p className="text-sm text-slate-500">Most common submission areas</p>
            </div>
          </div>
          <div className="space-y-3">
            {locations.zips.length > 0 ? (
              locations.zips.map((item) => (
                <BarRow key={item.label} label={item.label} count={item.count} max={zipMax} />
              ))
            ) : (
              <p className="text-sm text-slate-500">No ZIP code data yet.</p>
            )}
          </div>
          {locations.states.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">States</p>
              <div className="flex flex-wrap gap-2">
                {locations.states.map(({ label, count }) => (
                  <span key={label} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                    {label} · {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
