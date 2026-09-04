'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es as esLocale, enUS } from 'date-fns/locale'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Megaphone,
  Phone,
  X,
} from 'lucide-react'
import { LanguageToggle, useLanguage } from '@/components/intake/LanguageContext'
import { formatTimeDisplay, isPastDate, isWeekday, parseDateStr, toDateStr, clampArrivalTime, ARRIVAL_TIME_MIN, ARRIVAL_TIME_MAX } from '@/lib/volunteer/dates'
import {
  CLINIC,
  LAST_MINUTE_HOURS,
  downloadShiftIcs,
  hoursUntilDate,
  isSameCalendarDay,
} from '@/lib/volunteer/clinic'
import VolunteerStats from './VolunteerStats'
import VolunteerKnowHow from './VolunteerKnowHow'
import FirstTimeVolunteerPopup from './FirstTimeVolunteerNotice'

function weekdayDates(anchor) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return [0, 1, 2, 3, 4].map((i) => addDays(start, i))
}

function monthGrid(anchor) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 })
  const days = []
  let d = start
  while (d <= end) {
    days.push(d)
    d = addDays(d, 1)
  }
  return days
}

function weekStatus(days, shiftByDate, closureByDate) {
  return days.map((d) => {
    const key = toDateStr(d)
    if (closureByDate[key]) return 'closed'
    if (shiftByDate[key]?.is_mine) return 'mine'
    if (shiftByDate[key]) return 'covered'
    if (isPastDate(key)) return 'past'
    return 'open'
  })
}

export default function VolunteerSchedule({ session, onSignOut }) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const locale = isSpanish ? esLocale : enUS
  const isAdmin = !!session.isAdmin
  const volunteer = session.volunteer
  const first = volunteer?.name?.split(' ')[0] || ''

  const [view, setView] = useState('week')
  const [anchor, setAnchor] = useState(() => new Date())
  const [shifts, setShifts] = useState([])
  const [closures, setClosures] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [hoursDue, setHoursDue] = useState([])
  const [myUpcoming, setMyUpcoming] = useState([])
  const [todayShift, setTodayShift] = useState(null)
  const [beforeFirstDay, setBeforeFirstDay] = useState(false)
  const [openDays, setOpenDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [arrivalTime, setArrivalTime] = useState(ARRIVAL_TIME_MIN)
  const [hours, setHours] = useState('')
  const [shiftNote, setShiftNote] = useState('')
  const [closeReason, setCloseReason] = useState('')
  const [announceText, setAnnounceText] = useState('')
  const [assignVolunteerId, setAssignVolunteerId] = useState('')
  const [statsKey, setStatsKey] = useState(0)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelAck, setCancelAck] = useState(false)
  const [toast, setToast] = useState('')
  const [showFirstDayIntro, setShowFirstDayIntro] = useState(false)
  const pendingDayHandled = useRef(false)

  const range = useMemo(() => {
    const thisWeek = weekdayDates(new Date())
    const thisFrom = toDateStr(thisWeek[0])
    const thisTo = toDateStr(thisWeek[4])
    if (view === 'week') {
      const days = weekdayDates(anchor)
      const from = toDateStr(days[0])
      const to = toDateStr(days[4])
      return {
        from: from < thisFrom ? from : thisFrom,
        to: to > thisTo ? to : thisTo,
      }
    }
    const grid = monthGrid(anchor)
    const from = toDateStr(grid[0])
    const to = toDateStr(grid[grid.length - 1])
    return {
      from: from < thisFrom ? from : thisFrom,
      to: to > thisTo ? to : thisTo,
    }
  }, [view, anchor])

  const load = useCallback(async () => {
    setError('')
    try {
      const [schedRes, gapsRes] = await Promise.all([
        fetch(`/api/volunteer/schedule?from=${range.from}&to=${range.to}`),
        fetch('/api/volunteer/gaps'),
      ])
      const data = await schedRes.json()
      if (!schedRes.ok) throw new Error(data.error || 'Could not load schedule')
      setShifts(data.shifts || [])
      setClosures(data.closures || [])
      setAnnouncements(data.announcements || [])
      if (data.volunteers) setVolunteers(data.volunteers)
      setHoursDue(data.hoursDue || [])
      setMyUpcoming(data.myUpcoming || [])
      setTodayShift(data.todayShift || null)
      setBeforeFirstDay(!!data.beforeFirstDay)
      if (gapsRes.ok) {
        const gaps = await gapsRes.json()
        setOpenDays(gaps.open || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [range.from, range.to])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 4200)
    return () => clearTimeout(t)
  }, [toast])

  const shiftByDate = useMemo(() => {
    const map = {}
    for (const s of shifts) map[s.date] = s
    return map
  }, [shifts])
  const closureByDate = useMemo(() => {
    const map = {}
    for (const c of closures) map[c.date] = c
    return map
  }, [closures])

  const thisWeekDays = weekdayDates(new Date())
  const viewedWeekDays = weekdayDates(anchor)
  const thisWeekDots = weekStatus(thisWeekDays, shiftByDate, closureByDate)
  const viewedDots = weekStatus(viewedWeekDays, shiftByDate, closureByDate)

  const monthWeekdays = useMemo(() => {
    const start = startOfMonth(anchor)
    const end = endOfMonth(anchor)
    const days = []
    let d = start
    while (d <= end) {
      if (isWeekday(d)) days.push(d)
      d = addDays(d, 1)
    }
    return days
  }, [anchor])

  const monthDots = weekStatus(monthWeekdays, shiftByDate, closureByDate)
  const coverageDots = view === 'month' ? monthDots : viewedDots
  const weekFilled = coverageDots.filter((s) => s === 'covered' || s === 'mine').length
  const weekClosed = coverageDots.filter((s) => s === 'closed').length
  const weekOpen = coverageDots.filter((s) => s === 'open').length
  const weekNeeded = Math.max(0, coverageDots.length - weekClosed)
  const weekFull = weekNeeded > 0 && weekFilled === weekNeeded

  const selectedKey = selectedDate
  const selectedShift = selectedKey ? shiftByDate[selectedKey] : null
  const selectedClosure = selectedKey ? closureByDate[selectedKey] : null
  const selectedIsWeekday = selectedKey ? isWeekday(selectedKey) : false
  const selectedIsPast = selectedKey ? isPastDate(selectedKey) : false
  const canBook =
    selectedKey &&
    selectedIsWeekday &&
    !selectedClosure &&
    !selectedShift &&
    (isAdmin || !selectedIsPast)

  const selectedHoursLeft = selectedShift
    ? hoursUntilDate(selectedShift.date, selectedShift.arrival_time)
    : selectedKey
      ? hoursUntilDate(selectedKey, arrivalTime)
      : 0
  const lastMinute = selectedShift && selectedHoursLeft < LAST_MINUTE_HOURS && selectedHoursLeft > -2
  const sameDayShift = selectedShift && isSameCalendarDay(selectedShift.date)

  const openDay = (date) => {
    const key = toDateStr(date)
    setSelectedDate(key)
    setModalError('')
    setCloseReason('')
    setConfirmCancel(false)
    setCancelAck(false)
    const existing = shiftByDate[key]
    const bookable =
      isWeekday(key) && !closureByDate[key] && !existing && (isAdmin || !isPastDate(key))
    setShowFirstDayIntro(!isAdmin && beforeFirstDay && bookable)
    setArrivalTime(clampArrivalTime(existing?.arrival_time || ARRIVAL_TIME_MIN))
    setHours(existing?.hours_worked != null ? String(existing.hours_worked) : '')
    setShiftNote(existing?.note || '')
    setAssignVolunteerId(existing?.volunteer_id || '')
  }

  const closeModal = () => {
    setSelectedDate(null)
    setConfirmCancel(false)
    setCancelAck(false)
    setShowFirstDayIntro(false)
  }

  const showToast = (message) => setToast(message)

  const run = async (fn, successMessage) => {
    setSaving(true)
    setModalError('')
    try {
      await fn()
      await load()
      setStatsKey((k) => k + 1)
      closeModal()
      if (successMessage) showToast(successMessage)
    } catch (err) {
      setModalError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const jumpToDay = (key) => {
    const d = parseDateStr(key)
    setAnchor(d)
    setView('week')
    openDay(d)
  }

  useEffect(() => {
    if (loading || pendingDayHandled.current) return
    let pending = null
    try {
      pending = sessionStorage.getItem('apl_volunteer_pending_day')
    } catch {
      return
    }
    if (!pending || !/^\d{4}-\d{2}-\d{2}$/.test(pending)) return
    pendingDayHandled.current = true
    sessionStorage.removeItem('apl_volunteer_pending_day')
    jumpToDay(pending)
  }, [loading])

  const signUp = () =>
    run(async () => {
      const body = { date: selectedKey, arrival_time: arrivalTime, note: shiftNote }
      if (isAdmin && assignVolunteerId) body.volunteer_id = assignVolunteerId
      const res = await fetch('/api/volunteer/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save')
    }, isSpanish
      ? `Anotado · ${format(parseDateStr(selectedKey), 'EEE d MMM', { locale })} · ${formatTimeDisplay(arrivalTime)}`
      : `You're on · ${format(parseDateStr(selectedKey), 'EEE, MMM d', { locale })} · ${formatTimeDisplay(arrivalTime)}`)

  const updateShift = (payload) =>
    run(async () => {
      const res = await fetch(`/api/volunteer/shifts/${selectedShift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not update')
    }, isSpanish ? 'Guardado' : 'Saved')

  const saveHoursInline = async (shiftId, value) => {
    const res = await fetch(`/api/volunteer/shifts/${shiftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours_worked: value === '' ? null : value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Could not save hours')
    await load()
    setStatsKey((k) => k + 1)
  }

  const cancelShift = () =>
    run(async () => {
      const res = await fetch(`/api/volunteer/shifts/${selectedShift.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not cancel')
    }, isSpanish ? 'Día cancelado' : 'Day cancelled')

  const requestCancel = () => {
    if (lastMinute && !isAdmin) {
      setConfirmCancel(true)
      return
    }
    cancelShift()
  }

  const markClosed = () =>
    run(async () => {
      const res = await fetch('/api/volunteer/closures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedKey, reason: closeReason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not close day')
    })

  const reopen = () =>
    run(async () => {
      const res = await fetch(`/api/volunteer/closures?date=${selectedKey}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not reopen')
    })

  const postAnnouncement = async (e) => {
    e.preventDefault()
    if (!announceText.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/volunteer/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announceText.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not post')
      setAnnounceText('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteAnnouncement = async (id) => {
    await fetch(`/api/volunteer/announcements?id=${id}`, { method: 'DELETE' })
    await load()
  }

  const handleSignOut = async () => {
    await fetch('/api/volunteer/logout', { method: 'POST' })
    onSignOut()
  }

  const renderWeekCell = (date) => {
    const key = toDateStr(date)
    const shift = shiftByDate[key]
    const closed = closureByDate[key]
    const weekday = isWeekday(date)
    const past = isPastDate(key)
    const mine = shift?.is_mine
    const today = isToday(date)

    let tone = 'border-gray-100 bg-white text-gray-400'
    let status = ''
    let statusTone = 'text-gray-500'
    let pip = 'bg-gray-200'

    if (!weekday) {
      tone = 'border-transparent bg-gray-50/70 text-gray-300'
      status = isSpanish ? 'Fin de semana' : 'Weekend'
      pip = ''
    } else if (closed) {
      tone = 'border-gray-200 bg-gray-100 text-gray-400'
      status = closed.reason || (isSpanish ? 'Cerrado' : 'Closed')
      statusTone = 'text-gray-400'
      pip = 'bg-gray-300'
    } else if (shift && mine) {
      tone = 'border-apl-primary/35 bg-gradient-to-br from-apl-blue-50 to-white text-gray-900 shadow-sm'
      status = `${isSpanish ? 'Tú' : 'You'} · ${formatTimeDisplay(shift.arrival_time)}`
      statusTone = 'text-apl-blue-dark'
      pip = 'bg-apl-primary'
    } else if (shift) {
      tone = 'border-gray-200 bg-white text-gray-900'
      status = `${shift.volunteer_name} · ${formatTimeDisplay(shift.arrival_time)}`
      statusTone = 'text-gray-600'
      pip = 'bg-emerald-400'
    } else if (past) {
      tone = 'border-gray-100 bg-white text-gray-300'
      status = isSpanish ? 'Pasado' : 'Past'
      pip = 'bg-gray-200'
    } else {
      tone = 'border-dashed border-apl-orange/55 bg-gradient-to-br from-amber-50 to-white text-gray-900'
      status = isSpanish ? 'Se necesita' : 'Needs help'
      statusTone = 'text-apl-orange-dark'
      pip = 'bg-apl-orange volunteer-open-dot'
    }

    if (today) tone += ' ring-2 ring-apl-primary/35'

    const clickable = weekday && (closed || shift || !past || isAdmin)

    return (
      <button
        key={key}
        type="button"
        onClick={() => clickable && openDay(date)}
        className={`border text-left transition-all touch-manipulation rounded-2xl p-3.5 min-h-[4.35rem] ${tone} ${
          clickable ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
        }`}
        disabled={!clickable}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            {pip ? <span className={`h-1.5 w-1.5 rounded-full ${pip}`} /> : null}
            {format(date, 'EEE · MMM d', { locale })}
          </span>
          {today && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-apl-primary">
              {isSpanish ? 'Hoy' : 'Today'}
            </span>
          )}
        </div>
        {status ? (
          <p className={`text-xs mt-1.5 leading-snug font-medium ${statusTone}`}>{status}</p>
        ) : null}
      </button>
    )
  }

  const renderMonthCell = (date) => {
    const key = toDateStr(date)
    const inMonth = isSameMonth(date, anchor)
    const weekday = isWeekday(date)
    const today = isToday(date)
    const dayNum = format(date, 'd')

    if (!inMonth) {
      return <div key={key} className="aspect-square rounded-lg bg-transparent" aria-hidden />
    }

    if (!weekday) {
      return (
        <div
          key={key}
          className="aspect-square rounded-lg bg-gray-50/80 flex items-start justify-center pt-1.5 sm:pt-2"
        >
          <span className="text-[11px] sm:text-xs text-gray-300 tabular-nums">{dayNum}</span>
        </div>
      )
    }

    const shift = shiftByDate[key]
    const closed = closureByDate[key]
    const past = isPastDate(key)
    const mine = shift?.is_mine
    const clickable = closed || shift || !past || isAdmin

    let shell = 'bg-white border-gray-100'
    let dayColor = 'text-gray-800'
    let labelColor = 'text-gray-500'
    let label = ''

    if (closed) {
      shell = 'bg-gray-100 border-gray-200'
      dayColor = 'text-gray-500'
      labelColor = 'text-gray-400'
      label = isSpanish ? 'Cerrado' : 'Closed'
    } else if (shift && mine) {
      shell = 'bg-apl-blue-50 border-apl-primary/30'
      dayColor = 'text-apl-blue-dark'
      labelColor = 'text-apl-primary'
      label = isSpanish ? 'Tuyo' : 'Yours'
    } else if (shift) {
      shell = 'bg-emerald-50/80 border-emerald-200/80'
      dayColor = 'text-emerald-900'
      labelColor = 'text-emerald-600'
      label = isSpanish ? 'Tomado' : 'Taken'
    } else if (past) {
      shell = 'bg-white border-gray-100'
      dayColor = 'text-gray-400'
      labelColor = 'text-gray-300'
      label = isSpanish ? 'Pasado' : 'Past'
    } else {
      shell = 'bg-amber-50 border-apl-orange/40'
      dayColor = 'text-gray-900'
      labelColor = 'text-apl-orange-dark'
      label = isSpanish ? 'Abierto' : 'Open'
    }

    if (today) shell += ' ring-2 ring-apl-primary ring-offset-1'

    return (
      <button
        key={key}
        type="button"
        onClick={() => clickable && openDay(date)}
        disabled={!clickable}
        className={`aspect-square rounded-lg border flex flex-col items-center justify-between py-1 px-0.5 sm:py-1.5 transition-colors touch-manipulation ${shell} ${
          clickable ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'
        }`}
        aria-label={format(date, 'EEEE, MMMM d', { locale })}
      >
        <span
          className={`text-[11px] sm:text-sm font-bold tabular-nums leading-none ${today ? '' : dayColor} ${
            today
              ? 'flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-apl-primary text-white'
              : ''
          }`}
        >
          {dayNum}
        </span>
        <span className="min-h-[12px] flex items-center justify-center w-full px-0.5">
          {label ? (
            <span
              className={`text-[8px] sm:text-[10px] font-semibold leading-none truncate max-w-full uppercase tracking-wide ${labelColor}`}
            >
              {label}
            </span>
          ) : null}
        </span>
      </button>
    )
  }

  const myList = [...hoursDue, ...myUpcoming.filter((s) => !hoursDue.some((h) => h.id === s.id))].sort((a, b) =>
    a.date.localeCompare(b.date)
  )
  const nextOpen = openDays[0]

  return (
    <div className="space-y-5 md:space-y-6 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/book"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-apl-blue transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {isSpanish ? 'Inicio' : 'Home'}
        </Link>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {isAdmin && (
            <Link
              href="/volunteer/signups"
              className="text-xs font-medium text-apl-primary hover:text-apl-blue-dark px-2.5 py-1.5 rounded-lg hover:bg-apl-blue-50 transition-colors"
            >
              {isSpanish ? 'Usuarios' : 'Sign-ups'}
            </Link>
          )}
          <Link
            href="/volunteer/board"
            className="text-xs font-medium text-apl-primary hover:text-apl-blue-dark px-2.5 py-1.5 rounded-lg hover:bg-apl-blue-50 transition-colors"
          >
            {isSpanish ? 'Tablero' : 'Board'}
          </Link>
          <LanguageToggle />
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer px-2 py-1.5"
          >
            {isSpanish ? 'Salir' : 'Sign out'}
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-apl-primary via-[#2a78ab] to-[#1e4f8a] text-white px-4 py-4 sm:px-5 sm:py-5">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-10 h-28 w-28 rounded-full bg-apl-orange/30 blur-2xl pointer-events-none" />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 mb-1">
          {isSpanish ? 'Lavandería · APL Stockton' : 'Laundry · APL Stockton'}
        </p>
        <h1 className="relative text-xl sm:text-2xl font-bold tracking-tight">
          {isAdmin
            ? isSpanish
              ? 'Calendario · admin'
              : 'Calendar · admin'
            : isSpanish
              ? `Hola${first ? `, ${first}` : ''}`
              : `Hi${first ? `, ${first}` : ''}`}
        </h1>
        <p className="relative text-sm text-white/80 mt-1.5 leading-relaxed max-w-md">
          {isAdmin
            ? isSpanish
              ? 'Puedes asignar días, cerrar la clínica y publicar avisos.'
              : 'Assign days, close the clinic, and post notes for volunteers.'
            : isSpanish
              ? 'Un voluntario por día entre semana. Toca un día ámbar para anotarte.'
              : 'One volunteer per weekday. Tap an amber day to take it.'}
        </p>
        <div className="relative mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/75">
          {thisWeekDays.map((d, i) => (
            <span key={toDateStr(d)} className="inline-flex items-center gap-1">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  thisWeekDots[i] === 'open'
                    ? 'bg-apl-orange volunteer-open-dot'
                    : thisWeekDots[i] === 'mine'
                      ? 'bg-white'
                      : thisWeekDots[i] === 'covered'
                        ? 'bg-emerald-300'
                        : thisWeekDots[i] === 'closed'
                          ? 'bg-white/30'
                          : 'bg-white/25'
                }`}
              />
              {format(d, 'EEEEE', { locale })}
            </span>
          ))}
          <span className="text-white/50">·</span>
          <span>{isSpanish ? 'esta semana' : 'this week'}</span>
        </div>
      </div>

      <VolunteerStats refreshKey={statsKey} />

      {todayShift && (
        <div className="rounded-2xl border border-apl-primary/25 bg-apl-blue-50 px-3.5 py-3.5 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-apl-primary text-white">
              <Clock className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {isSpanish ? 'Hoy te toca' : "You're on today"}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {isSpanish ? 'Llegada' : 'Arrive'} · {formatTimeDisplay(todayShift.arrival_time)}
                {' · '}
                {isSpanish ? 'Pasa por recepción' : 'Check in at the front desk'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${CLINIC.tel}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-gray-100 py-2 text-xs font-semibold text-gray-800"
            >
              <Phone className="w-3.5 h-3.5 text-apl-primary" />
              {isSpanish ? 'Llamar' : 'Call'}
            </a>
            <a
              href={CLINIC.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-gray-100 py-2 text-xs font-semibold text-gray-800"
            >
              <MapPin className="w-3.5 h-3.5 text-apl-orange" />
              {isSpanish ? 'Mapa' : 'Map'}
            </a>
            <button
              type="button"
              onClick={() =>
                downloadShiftIcs({
                  date: todayShift.date,
                  time: todayShift.arrival_time,
                  isSpanish,
                })
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-gray-100 py-2 text-xs font-semibold text-gray-800 cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-gray-500" />
              {isSpanish ? 'Calendario' : 'Calendar'}
            </button>
          </div>
        </div>
      )}

      {hoursDue.length > 0 && (
        <div className="rounded-2xl border border-apl-orange/30 bg-amber-50 px-3.5 py-3.5 space-y-2.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-apl-orange-dark shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {isSpanish ? 'Faltan horas por registrar' : 'Hours still to log'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {isSpanish
                  ? 'Opcional, pero ayuda a la clínica a reportar el trabajo de voluntarios.'
                  : 'Optional, but it helps the clinic report volunteer time.'}
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {hoursDue.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2">
                <span className="text-sm font-medium text-gray-800">
                  {format(parseDateStr(s.date), 'EEE, MMM d', { locale })}
                </span>
                <label className="flex items-center gap-2 text-xs text-gray-500">
                  {isSpanish ? 'Horas' : 'Hours'}
                  <input
                    key={`${s.id}-${s.hours_worked ?? 'none'}`}
                    type="number"
                    min="0"
                    max="16"
                    step="0.5"
                    inputMode="decimal"
                    defaultValue={s.hours_worked ?? ''}
                    onBlur={(e) => {
                      const v = e.target.value
                      if (String(s.hours_worked ?? '') === v) return
                      saveHoursInline(s.id, v).catch(() => {})
                    }}
                    className="w-16 intake-input px-2 py-1.5 rounded-lg border border-gray-200 text-sm"
                  />
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!todayShift && nextOpen && myUpcoming.length === 0 && (
        <button
          type="button"
          onClick={() => jumpToDay(nextOpen)}
          className="w-full text-left rounded-2xl border border-dashed border-apl-orange/50 bg-amber-50/80 px-3.5 py-3.5 cursor-pointer touch-manipulation hover:bg-amber-50 transition-colors"
        >
          <p className="text-sm font-semibold text-gray-900">
            {isSpanish ? 'Próximo día abierto' : 'Next open day'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {format(parseDateStr(nextOpen), 'EEEE, MMMM d', { locale })}
            {' · '}
            {isSpanish ? 'Toca para anotarte' : 'Tap to take it'}
          </p>
        </button>
      )}

      {openDays.length > 0 && (todayShift || myUpcoming.length > 0) && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
            {isSpanish ? 'Días que aún faltan' : 'Still needs someone'}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
            {openDays.slice(0, 8).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => jumpToDay(day)}
                className="shrink-0 rounded-full border border-apl-orange/40 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-apl-orange-dark cursor-pointer touch-manipulation"
              >
                {format(parseDateStr(day), 'EEE d', { locale })}
              </button>
            ))}
          </div>
        </div>
      )}

      {announcements.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-2.5 rounded-2xl border border-apl-orange/25 bg-amber-50 px-3.5 py-3 text-sm text-gray-800"
        >
          <Megaphone className="w-4 h-4 text-apl-orange shrink-0 mt-0.5" />
          <p className="flex-1 leading-relaxed">{a.message}</p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => deleteAnnouncement(a.id)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
              aria-label="Remove announcement"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      {isAdmin && (
        <form onSubmit={postAnnouncement} className="flex flex-col sm:flex-row gap-2">
          <input
            value={announceText}
            onChange={(e) => setAnnounceText(e.target.value)}
            placeholder={isSpanish ? 'Anuncio para voluntarios…' : 'Announcement for volunteers…'}
            className="flex-1 intake-input px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <button
            type="submit"
            disabled={saving || !announceText.trim()}
            className="px-4 py-2.5 bg-apl-primary text-white text-sm font-semibold rounded-xl hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer"
          >
            {isSpanish ? 'Publicar' : 'Post'}
          </button>
        </form>
      )}

      <VolunteerKnowHow isSpanish={isSpanish} />

      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3 sm:p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">
              {view === 'month'
                ? isSpanish
                  ? 'Este mes'
                  : 'This month'
                : isSpanish
                  ? 'Semana en vista'
                  : 'Week in view'}
            </p>
            {weekFull ? (
              <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                {view === 'month'
                  ? isSpanish
                    ? 'Mes cubierto'
                    : 'Month is covered'
                  : isSpanish
                    ? 'Semana cubierta'
                    : 'Week is covered'}
              </p>
            ) : (
              <p className="text-sm font-semibold text-gray-900">
                <span className="text-apl-primary">{weekFilled}</span>
                <span className="text-gray-400"> / {weekNeeded}</span>{' '}
                <span className="font-medium text-gray-600">
                  {weekOpen === 1
                    ? isSpanish
                      ? 'días · 1 abierto'
                      : 'days · 1 open'
                    : isSpanish
                      ? 'días cubiertos'
                      : 'days covered'}
                </span>
              </p>
            )}
          </div>
          <div className="flex rounded-xl border border-gray-200 p-0.5 bg-white">
            {['week', 'month'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer touch-manipulation transition-colors ${
                  view === v ? 'bg-apl-primary text-white' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {v === 'week' ? (isSpanish ? 'Semana' : 'Week') : isSpanish ? 'Mes' : 'Month'}
              </button>
            ))}
          </div>
        </div>
        {view === 'week' && (
          <div className="flex items-center justify-center gap-1.5">
            {viewedWeekDays.map((d, i) => (
              <button
                key={toDateStr(d)}
                type="button"
                onClick={() => openDay(d)}
                className={`h-2.5 w-2.5 rounded-full cursor-pointer ${
                  viewedDots[i] === 'open'
                    ? 'bg-apl-orange volunteer-open-dot'
                    : viewedDots[i] === 'mine'
                      ? 'bg-apl-primary'
                      : viewedDots[i] === 'covered'
                        ? 'bg-emerald-400'
                        : viewedDots[i] === 'closed'
                          ? 'bg-gray-300'
                          : 'bg-gray-200'
                }`}
                aria-label={format(d, 'EEEE', { locale })}
              />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setAnchor((d) => (view === 'week' ? addWeeks(d, -1) : addMonths(d, -1)))}
            className="p-2 rounded-xl hover:bg-white cursor-pointer touch-manipulation"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-800 truncate px-2">
            {view === 'week'
              ? `${format(viewedWeekDays[0], 'MMM d', { locale })} – ${format(viewedWeekDays[4], 'MMM d', { locale })}`
              : format(anchor, 'MMMM yyyy', { locale })}
          </span>
          <button
            type="button"
            onClick={() => setAnchor((d) => (view === 'week' ? addWeeks(d, 1) : addMonths(d, 1)))}
            className="p-2 rounded-xl hover:bg-white cursor-pointer touch-manipulation"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-apl-orange" />
            {isSpanish ? 'Abierto' : 'Open'}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-apl-primary" />
            {isSpanish ? 'Tú' : 'You'}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {isSpanish ? 'Cubierto' : 'Covered'}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            {isSpanish ? 'Cerrado' : 'Closed'}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-apl-primary" />
        </div>
      ) : view === 'week' ? (
        <div className="grid grid-cols-1 gap-2">
          {viewedWeekDays.map((d) => renderWeekCell(d))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {(isSpanish ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map(
              (label, i) => (
                <div
                  key={`${label}-${i}`}
                  className={`text-center text-[10px] font-semibold tracking-wide py-1 ${
                    i >= 5 ? 'text-gray-300' : 'text-gray-400'
                  }`}
                >
                  {label}
                </div>
              )
            )}
          </div>
          <div className="grid grid-cols-7 gap-1">{monthGrid(anchor).map((d) => renderMonthCell(d))}</div>
        </div>
      )}

      {myList.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
            {isSpanish ? 'Mis días' : 'My days'}
          </h2>
          <ul className="space-y-2">
            {myList.map((s) => {
              const pastOrToday = s.date <= toDateStr(new Date())
              const soon = hoursUntilDate(s.date, s.arrival_time) < LAST_MINUTE_HOURS && s.date >= toDateStr(new Date())
              return (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openDay(parseDateStr(s.date))}
                      className="flex-1 text-left text-sm cursor-pointer touch-manipulation py-0.5"
                    >
                      <span className="font-semibold text-gray-900">
                        {format(parseDateStr(s.date), 'EEE, MMM d', { locale })}
                      </span>
                      <span className="text-gray-500"> · {formatTimeDisplay(s.arrival_time)}</span>
                      {soon && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-apl-orange-dark">
                          {isSpanish ? 'Pronto' : 'Soon'}
                        </span>
                      )}
                      {s.note ? <p className="text-xs text-gray-400 mt-0.5 truncate">{s.note}</p> : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadShiftIcs({ date: s.date, time: s.arrival_time, isSpanish })}
                      className="p-2 rounded-lg text-gray-400 hover:text-apl-primary hover:bg-apl-blue-50 cursor-pointer"
                      aria-label={isSpanish ? 'Añadir al calendario' : 'Add to calendar'}
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  </div>
                  {pastOrToday && (
                    <label className="flex items-center justify-between gap-2 text-xs text-gray-500">
                      {isSpanish ? 'Horas (opcional)' : 'Hours (optional)'}
                      <input
                        key={`${s.id}-${s.hours_worked ?? 'none'}`}
                        type="number"
                        min="0"
                        max="16"
                        step="0.5"
                        inputMode="decimal"
                        defaultValue={s.hours_worked ?? ''}
                        onBlur={(e) => {
                          const v = e.target.value
                          if (String(s.hours_worked ?? '') === v) return
                          saveHoursInline(s.id, v).catch(() => {})
                        }}
                        className="w-20 intake-input px-2.5 py-2 rounded-xl border border-gray-200 text-base"
                      />
                    </label>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={closeModal} aria-label="Close" />
          <div className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
            <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-gray-200 sm:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-lg leading-snug tracking-tight">
                  {format(parseDateStr(selectedDate), 'EEE, MMM d', { locale })}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {!selectedIsWeekday
                    ? isSpanish
                      ? 'No se necesita lavandería el fin de semana.'
                      : 'No laundry coverage on weekends.'
                    : selectedClosure
                      ? selectedClosure.reason || (isSpanish ? 'Clínica cerrada' : 'Clinic closed')
                      : selectedShift
                        ? selectedShift.is_mine
                          ? isSpanish
                            ? 'Este es tu día.'
                            : 'This is your day.'
                          : isSpanish
                            ? `Cubierto por ${selectedShift.volunteer_name}`
                            : `Covered by ${selectedShift.volunteer_name}`
                        : isSpanish
                          ? 'Día abierto — se necesita un voluntario.'
                          : 'Open — a volunteer is needed.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 -mr-1 text-gray-400 hover:text-gray-700 cursor-pointer touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && <p className="text-sm text-red-500">{modalError}</p>}

            {showFirstDayIntro && canBook && !confirmCancel ? (
              <FirstTimeVolunteerPopup
                isSpanish={isSpanish}
                onContinue={() => setShowFirstDayIntro(false)}
              />
            ) : (
              <>
            {confirmCancel && selectedShift && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 space-y-3">
                <p className="text-sm font-semibold text-red-800">
                  {sameDayShift
                    ? isSpanish
                      ? 'Estás en el calendario de hoy.'
                      : "You're on the schedule today."
                    : isSpanish
                      ? 'Faltan menos de 24 horas.'
                      : 'This is less than 24 hours away.'}
                </p>
                <p className="text-xs text-red-800/80 leading-relaxed">
                  {isSpanish
                    ? 'Llama a la clínica para que no te esperen, luego cancela aquí para liberar el día.'
                    : 'Call the clinic so they aren’t waiting, then cancel here so someone else can take the day.'}
                </p>
                <a
                  href={`tel:${CLINIC.tel}`}
                  className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-white border border-red-200 text-sm font-semibold text-red-800"
                >
                  <Phone className="w-4 h-4" />
                  {CLINIC.phoneDisplay}
                </a>
                <label className="flex items-start gap-2 text-xs text-red-900">
                  <input
                    type="checkbox"
                    checked={cancelAck}
                    onChange={(e) => setCancelAck(e.target.checked)}
                    className="mt-0.5"
                  />
                  {isSpanish
                    ? 'Entiendo que la clínica puede estar esperándome.'
                    : 'I understand the clinic may be waiting for me.'}
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={saving || !cancelAck}
                    onClick={cancelShift}
                    className="w-full min-h-[44px] py-2.5 bg-red-600 text-white font-medium rounded-xl disabled:opacity-50 cursor-pointer text-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isSpanish ? 'Sí, cancelar' : 'Yes, cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    className="w-full py-2 text-sm text-gray-600 cursor-pointer"
                  >
                    {isSpanish ? 'Mantener mi día' : 'Keep my day'}
                  </button>
                </div>
              </div>
            )}

            {canBook && !confirmCancel && (
              <>
                {isAdmin && volunteers.length === 0 && (
                  <p className="text-xs text-gray-500">
                    {isSpanish
                      ? 'Todavía no hay voluntarios registrados. Alguien debe crear una cuenta primero, o marca el día como cerrado.'
                      : 'No volunteers yet. Someone needs to sign up first, or mark the clinic closed.'}
                  </p>
                )}
                {isAdmin && volunteers.length > 0 && (
                  <label className="block text-xs text-gray-600">
                    {isSpanish ? 'Asignar a' : 'Assign to'}
                    <select
                      value={assignVolunteerId}
                      onChange={(e) => setAssignVolunteerId(e.target.value)}
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-300 text-base"
                    >
                      <option value="">{isSpanish ? 'Elige alguien' : 'Choose a volunteer'}</option>
                      {volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {isSameCalendarDay(selectedKey) && (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-apl-orange/25 rounded-xl px-3 py-2 leading-relaxed">
                    {isSpanish
                      ? 'Esto es hoy. Si cambian los planes, llama a la clínica.'
                      : 'This is today. If plans change, call the clinic so they aren’t waiting.'}{' '}
                    <a href={`tel:${CLINIC.tel}`} className="font-semibold underline underline-offset-2">
                      {CLINIC.phoneDisplay}
                    </a>
                  </p>
                )}
                <TimePicker value={arrivalTime} onChange={setArrivalTime} isSpanish={isSpanish} />
                <label className="block text-xs text-gray-600">
                  {isSpanish ? 'Nota (opcional)' : 'Note (optional)'}
                  <input
                    value={shiftNote}
                    onChange={(e) => setShiftNote(e.target.value.slice(0, 140))}
                    placeholder={
                      isSpanish ? 'Ej. primera vez, llego un poco tarde…' : 'e.g. first time, running a bit late…'
                    }
                    className="mt-1 w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-base"
                  />
                </label>
                <ul className="text-xs text-gray-500 space-y-1 rounded-xl bg-gray-50 px-3 py-2.5">
                  <li>· {isSpanish ? 'Pasa por recepción al llegar.' : 'Check in at the front desk when you arrive.'}</li>
                  <li>
                    ·{' '}
                    {isSpanish
                      ? 'Elige una hora entre 8:00 AM y 4:00 PM.'
                      : 'Pick a time between 8:00 AM and 4:00 PM.'}
                  </li>
                  <li>· {isSpanish ? 'Si cancelas con poco aviso, llama a la clínica.' : 'If you cancel last-minute, call the clinic.'}</li>
                </ul>
                <button
                  type="button"
                  disabled={saving || (isAdmin && !assignVolunteerId)}
                  onClick={signUp}
                  className="w-full min-h-[44px] py-2.5 bg-apl-primary text-white font-medium rounded-xl hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer text-sm touch-manipulation"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isSpanish ? 'Anotar este día' : 'Take this day'}
                </button>
              </>
            )}

            {selectedShift && (selectedShift.is_mine || isAdmin) && !confirmCancel && (
              <>
                <TimePicker value={arrivalTime} onChange={setArrivalTime} isSpanish={isSpanish} />
                {(selectedIsPast || selectedDate === toDateStr(new Date()) || isAdmin) && (
                  <label className="block text-xs text-gray-600">
                    {isSpanish ? 'Horas trabajadas (opcional)' : 'Hours worked (optional)'}
                    <input
                      type="number"
                      min="0"
                      max="16"
                      step="0.5"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="mt-1 w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-base"
                    />
                  </label>
                )}
                <label className="block text-xs text-gray-600">
                  {isSpanish ? 'Nota (opcional)' : 'Note (optional)'}
                  <input
                    value={shiftNote}
                    onChange={(e) => setShiftNote(e.target.value.slice(0, 140))}
                    className="mt-1 w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-base"
                  />
                </label>
                <div className="flex gap-2">
                  <a
                    href={CLINIC.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl border border-gray-200 text-xs font-semibold text-gray-700"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {isSpanish ? 'Mapa' : 'Map'}
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      downloadShiftIcs({ date: selectedShift.date, time: arrivalTime, isSpanish })
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    {isSpanish ? 'Calendario' : 'Calendar'}
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      updateShift({
                        arrival_time: arrivalTime,
                        note: shiftNote,
                        ...(hours !== '' || selectedShift.hours_worked != null
                          ? { hours_worked: hours === '' ? null : hours }
                          : {}),
                      })
                    }
                    className="w-full min-h-[44px] py-2.5 bg-apl-primary text-white font-medium rounded-xl hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer text-sm touch-manipulation"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isSpanish ? 'Guardar' : 'Save'}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={requestCancel}
                    className="w-full min-h-[44px] py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 cursor-pointer text-sm touch-manipulation"
                  >
                    {isSpanish ? 'Cancelar día' : 'Cancel day'}
                  </button>
                </div>
              </>
            )}

            {isAdmin && selectedIsWeekday && !selectedClosure && !confirmCancel && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <input
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder={isSpanish ? 'Motivo (opcional)' : 'Reason (optional)'}
                  className="w-full intake-input px-3 py-2 rounded-lg border border-gray-300 text-sm"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={markClosed}
                  className="w-full py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {isSpanish ? 'Marcar clínica cerrada' : 'Mark clinic closed'}
                </button>
              </div>
            )}

            {isAdmin && selectedClosure && (
              <button
                type="button"
                disabled={saving}
                onClick={reopen}
                className="w-full py-2.5 bg-apl-primary text-white font-medium rounded-xl hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer text-sm"
              >
                {isSpanish ? 'Reabrir este día' : 'Reopen this day'}
              </button>
            )}
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] max-w-[min(90vw,22rem)] rounded-full bg-gray-900 text-white text-sm font-medium px-4 py-2.5 shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}

function TimePicker({ value, onChange, isSpanish }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {isSpanish ? '¿A qué hora llegas?' : 'What time are you coming?'}
      </label>
      <input
        type="time"
        value={clampArrivalTime(value || ARRIVAL_TIME_MIN)}
        min={ARRIVAL_TIME_MIN}
        max={ARRIVAL_TIME_MAX}
        step="1800"
        onChange={(e) => onChange(clampArrivalTime(e.target.value))}
        className="w-full min-h-[48px] intake-input px-3.5 py-3 rounded-xl border border-gray-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-apl-primary/25 focus:border-apl-primary"
      />
      <p className="text-[11px] text-gray-400 mt-1.5">
        {isSpanish ? 'Entre 8:00 AM y 4:00 PM' : 'Between 8:00 AM and 4:00 PM'}
      </p>
    </div>
  )
}
