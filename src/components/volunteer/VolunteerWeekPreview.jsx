'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, addWeeks, format, isToday, startOfWeek } from 'date-fns'
import { es as esLocale, enUS } from 'date-fns/locale'
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { formatTimeDisplay, isPastDate, toDateStr } from '@/lib/volunteer/dates'

function weekdayDates(anchor) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return [0, 1, 2, 3, 4].map((i) => addDays(start, i))
}

export default function VolunteerWeekPreview({ isSpanish, onTakeOpenDay }) {
  const locale = isSpanish ? esLocale : enUS
  const [anchor, setAnchor] = useState(() => new Date())
  const [days, setDays] = useState([])
  const [stats, setStats] = useState({ covered: 0, open: 0, total: 5 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const weekDates = useMemo(() => weekdayDates(anchor), [anchor])
  const range = useMemo(
    () => ({ from: toDateStr(weekDates[0]), to: toDateStr(weekDates[4]) }),
    [weekDates]
  )

  const isThisWeek = useMemo(() => {
    const now = weekdayDates(new Date())
    return toDateStr(now[0]) === range.from
  }, [range.from])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/volunteer/preview?from=${range.from}&to=${range.to}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load week')
      setDays(data.days || [])
      setStats({ covered: data.covered ?? 0, open: data.open ?? 0, total: data.total ?? 5 })
    } catch (err) {
      setError(err.message)
      setDays([])
    } finally {
      setLoading(false)
    }
  }, [range.from, range.to])

  useEffect(() => {
    load()
  }, [load])

  const dayByDate = useMemo(() => {
    const map = {}
    for (const d of days) map[d.date] = d
    return map
  }, [days])

  const weekFull = stats.total > 0 && stats.covered === stats.total

  const labels = {
    open: isSpanish ? 'Abierto' : 'Open',
    covered: isSpanish ? 'Cubierto' : 'Covered',
    closed: isSpanish ? 'Cerrado' : 'Closed',
    past: isSpanish ? 'Pasado' : 'Past',
  }

  return (
    <section className="rounded-2xl border border-apl-primary/15 bg-gradient-to-br from-slate-50 via-white to-apl-blue-50/40 overflow-hidden">
      <div className="px-3.5 pt-3.5 pb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-apl-primary/70">
            {isSpanish ? 'Esta semana en la clínica' : 'Clinic week at a glance'}
          </p>
          {weekFull ? (
            <p className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              {isSpanish ? 'Semana cubierta' : 'Week is covered'}
            </p>
          ) : (
            <p className="text-sm font-bold text-gray-900 mt-0.5 tabular-nums">
              <span className="text-apl-primary">{stats.covered}</span>
              <span className="text-gray-400 font-semibold">/{stats.total}</span>
              <span className="text-gray-600 font-semibold ml-1">
                {isSpanish ? 'días' : 'days covered'}
              </span>
              {stats.open > 0 && (
                <span className="text-apl-orange-dark font-semibold ml-1.5">
                  · {stats.open} {isSpanish ? 'abierto' : stats.open === 1 ? 'open' : 'open'}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setAnchor((d) => addWeeks(d, -1))}
            className="p-1.5 rounded-lg hover:bg-white/80 text-gray-500 cursor-pointer touch-manipulation"
            aria-label={isSpanish ? 'Semana anterior' : 'Previous week'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(new Date())}
            disabled={isThisWeek}
            className="px-2 py-1 text-[10px] font-semibold rounded-md text-apl-primary disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            {isSpanish ? 'Hoy' : 'Today'}
          </button>
          <button
            type="button"
            onClick={() => setAnchor((d) => addWeeks(d, 1))}
            className="p-1.5 rounded-lg hover:bg-white/80 text-gray-500 cursor-pointer touch-manipulation"
            aria-label={isSpanish ? 'Próxima semana' : 'Next week'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="px-3.5 text-[11px] text-gray-500 -mt-1 mb-2">
        {format(weekDates[0], 'MMM d', { locale })} – {format(weekDates[4], 'MMM d', { locale })}
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-apl-primary" />
        </div>
      ) : error ? (
        <p className="px-3.5 pb-3.5 text-xs text-gray-400 text-center">{error}</p>
      ) : (
        <ul className="grid grid-cols-5 gap-1 px-2 pb-2.5">
          {weekDates.map((date) => {
            const key = toDateStr(date)
            const info = dayByDate[key]
            const status = info?.status || (isPastDate(key) ? 'past' : 'open')
            const today = isToday(date)
            const clickable = status === 'open' && onTakeOpenDay

            let shell = 'bg-white border-gray-100 text-gray-400'
            let word = labels.past
            let sub = ''

            if (status === 'closed') {
              shell = 'bg-gray-100 border-gray-200 text-gray-400'
              word = labels.closed
            } else if (status === 'covered') {
              shell = 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
              word = labels.covered
              sub = info?.arrival_time ? formatTimeDisplay(info.arrival_time) : ''
            } else if (status === 'open') {
              shell = 'bg-amber-50 border-apl-orange/45 text-apl-orange-dark shadow-sm'
              word = labels.open
            } else if (status === 'past') {
              shell = 'bg-white/60 border-gray-100 text-gray-300'
              word = labels.past
            }

            if (today) shell += ' ring-2 ring-apl-primary/40 ring-offset-1'

            const inner = (
              <>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide leading-none ${
                    today ? 'text-apl-primary' : ''
                  }`}
                >
                  {format(date, 'EEE', { locale }).slice(0, 3)}
                </span>
                <span
                  className={`text-base font-bold tabular-nums leading-none ${
                    today
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-apl-primary text-white text-xs'
                      : ''
                  }`}
                >
                  {format(date, 'd')}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide leading-tight text-center px-0.5">
                  {word}
                </span>
                {sub ? (
                  <span className="text-[8px] text-emerald-600/80 leading-none tabular-nums">{sub}</span>
                ) : (
                  <span className="h-2" />
                )}
              </>
            )

            return (
              <li key={key} className="min-w-0">
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onTakeOpenDay(key)}
                    className={`w-full flex flex-col items-center gap-1 py-2 px-0.5 rounded-xl border transition-transform active:scale-[0.97] cursor-pointer touch-manipulation ${shell}`}
                  >
                    {inner}
                  </button>
                ) : (
                  <div
                    className={`flex flex-col items-center gap-1 py-2 px-0.5 rounded-xl border ${shell}`}
                  >
                    {inner}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {!loading && stats.open > 0 && onTakeOpenDay && (
        <p className="px-3.5 pb-3 text-[10px] text-center text-gray-400">
          {isSpanish ? 'Toca un día abierto para empezar' : 'Tap an open day to get started'}
        </p>
      )}
    </section>
  )
}
