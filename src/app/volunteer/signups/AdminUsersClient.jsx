'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Phone,
  Search,
  Users,
} from 'lucide-react'
import { formatTimeDisplay, parseDateStr } from '@/lib/volunteer/dates'

function formatSignedUp(iso) {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'MMM d, yyyy · h:mm a')
  } catch {
    return iso
  }
}

function formatShiftDate(yyyyMmDd) {
  try {
    return format(parseDateStr(yyyyMmDd), 'EEE, MMM d, yyyy')
  } catch {
    return yyyyMmDd
  }
}

export default function AdminUsersClient() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/volunteer/users')
        if (res.status === 401) {
          if (!cancelled) setUnauthorized(true)
          return
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load volunteers')
        if (!cancelled) setUsers(data.users || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const updateShiftHours = (userId, shiftId, hoursWorked) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u
        const shifts = u.shifts.map((s) => (s.id === shiftId ? { ...s, hours_worked: hoursWorked } : s))
        const total = shifts.reduce((sum, s) => sum + (Number(s.hours_worked) || 0), 0)
        return { ...u, shifts, total_hours: Math.round(total * 10) / 10 }
      })
    )
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const hay = [u.name, u.email, u.phone, u.phone_normalized, u.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [users, query])

  if (unauthorized) {
    return (
      <div className="space-y-4 text-center py-8">
        <Users className="w-10 h-10 text-apl-primary/40 mx-auto" />
        <h1 className="text-lg font-bold text-gray-900">Admin only</h1>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Sign in as admin on the volunteer page first (email + password), then open Sign-ups.
        </p>
        <Link
          href="/volunteer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-apl-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to volunteer sign-in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/volunteer"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-apl-blue transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Calendar
        </Link>
      </div>

      <div className="text-center space-y-2">
        <Link href="/book" className="inline-flex justify-center">
          <Image
            src="/logo.png"
            alt="Animal Protection League"
            width={120}
            height={120}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-apl-primary/80 mb-1">
            Volunteer admin
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">All sign-ups</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading…' : `${users.length} volunteer${users.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, or phone"
          className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-gray-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-apl-primary/25 focus:border-apl-primary"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-apl-primary" />
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 text-center py-6">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          {users.length === 0 ? 'No volunteers have signed up yet.' : 'No matches for that search.'}
        </p>
      )}

      <ul className="space-y-3">
        {filtered.map((u) => {
          const open = expandedId === u.id
          return (
            <li
              key={u.id}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : u.id)}
                className="w-full text-left px-4 py-3.5 flex items-start gap-3 cursor-pointer hover:bg-gray-50/80 transition-colors touch-manipulation"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-apl-blue-50 text-apl-primary text-sm font-bold">
                  {(u.name || '?').trim().charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900 truncate">
                    {u.name || 'Unnamed'}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5 truncate">
                    {u.email || u.phone || 'No contact on file'}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                    <span>
                      {u.shift_count} shift{u.shift_count === 1 ? '' : 's'}
                    </span>
                    {u.upcoming_count > 0 && (
                      <span className="text-apl-primary">{u.upcoming_count} upcoming</span>
                    )}
                    {u.total_hours > 0 && <span>{u.total_hours} hrs logged</span>}
                  </span>
                </span>
                {open ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                )}
              </button>

              {open && (
                <div className="border-t border-gray-100 px-4 py-3.5 space-y-3 bg-gray-50/60">
                  <dl className="grid gap-2.5 text-sm">
                    <Detail label="Name" value={u.name || '—'} />
                    <Detail
                      label="Email"
                      value={
                        u.email ? (
                          <a
                            href={`mailto:${u.email}`}
                            className="inline-flex items-center gap-1.5 text-apl-primary hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {u.email}
                          </a>
                        ) : (
                          '—'
                        )
                      }
                    />
                    <Detail
                      label="Phone"
                      value={
                        u.phone ? (
                          <a
                            href={`tel:${u.phone_normalized || u.phone}`}
                            className="inline-flex items-center gap-1.5 text-apl-primary hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {u.phone}
                          </a>
                        ) : (
                          '—'
                        )
                      }
                    />
                    <Detail label="Phone (normalized)" value={u.phone_normalized || '—'} />
                    <Detail label="Signed up" value={formatSignedUp(u.created_at)} />
                    <Detail label="Last updated" value={formatSignedUp(u.updated_at)} />
                    <Detail label="Volunteer ID" value={<span className="font-mono text-xs break-all">{u.id}</span>} />
                    <Detail
                      label="Totals"
                      value={`${u.shift_count} shifts · ${u.upcoming_count} upcoming · ${u.past_count} past · ${u.total_hours} hrs`}
                    />
                  </dl>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-2">
                      Shifts
                    </p>
                    {u.shifts.length === 0 ? (
                      <p className="text-xs text-gray-500">No shifts yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {u.shifts.map((s) => (
                          <li
                            key={s.id}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700"
                          >
                            <p className="font-semibold text-gray-900">
                              {formatShiftDate(s.shift_date)}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-gray-500">Arrive {formatTimeDisplay(s.arrival_time)}</p>
                              <ShiftHoursInput
                                shift={s}
                                onSaved={(hoursWorked) => updateShiftHours(u.id, s.id, hoursWorked)}
                              />
                            </div>
                            {s.note ? (
                              <p className="mt-1 text-gray-600 leading-relaxed">Note: {s.note}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ShiftHoursInput({ shift, onSaved }) {
  const initial = shift.hours_worked == null || shift.hours_worked === '' ? '' : String(shift.hours_worked)
  const [value, setValue] = useState(initial)
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [message, setMessage] = useState('')

  const save = async () => {
    const next = value.trim()
    if (next === initial) return
    setStatus('saving')
    setMessage('')
    try {
      const res = await fetch(`/api/volunteer/shifts/${shift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours_worked: next === '' ? null : next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save hours')
      const saved = data.shift?.hours_worked ?? null
      setValue(saved == null ? '' : String(saved))
      onSaved(saved)
      setStatus('saved')
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <label className="inline-flex items-center gap-1.5 text-gray-500">
        Hours
        <input
          type="number"
          inputMode="decimal"
          min="0"
          max="16"
          step="0.5"
          value={value}
          placeholder="—"
          onChange={(e) => {
            setValue(e.target.value)
            if (status !== 'saving') setStatus('idle')
          }}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          disabled={status === 'saving'}
          className="w-16 intake-input px-2 py-1 rounded-lg border border-gray-300 text-sm text-gray-900 text-right"
        />
        <span className="w-4 inline-flex justify-center">
          {status === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin text-apl-primary" />}
          {status === 'saved' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
        </span>
      </label>
      {status === 'error' && <span className="text-[11px] text-red-500">{message}</span>}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 items-start">
      <dt className="text-xs font-medium text-gray-400 pt-0.5">{label}</dt>
      <dd className="text-gray-800 break-words min-w-0">{value}</dd>
    </div>
  )
}
