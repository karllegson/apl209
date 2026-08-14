import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { firstName } from '@/lib/volunteer/auth'
import { isPastDate, isWeekday, toDateStr } from '@/lib/volunteer/dates'

/** Public weekday coverage — no auth required. First names only. */
export async function GET(request) {
  const url = new URL(request.url)
  const from = url.searchParams.get('from') || ''
  const to = url.searchParams.get('to') || ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: 'from and to dates are required (YYYY-MM-DD).' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const [shiftsRes, closuresRes] = await Promise.all([
    admin
      .from('volunteer_shifts')
      .select('shift_date, arrival_time, volunteer_id')
      .gte('shift_date', from)
      .lte('shift_date', to)
      .order('shift_date', { ascending: true }),
    admin
      .from('volunteer_closures')
      .select('closed_date, reason')
      .gte('closed_date', from)
      .lte('closed_date', to),
  ])

  if (shiftsRes.error?.code === '42P01') {
    return NextResponse.json({ days: [], covered: 0, open: 0, total: 0 })
  }
  if (shiftsRes.error) return NextResponse.json({ error: shiftsRes.error.message }, { status: 500 })

  const shiftByDate = {}
  for (const s of shiftsRes.data || []) shiftByDate[s.shift_date] = s

  const closureByDate = {}
  for (const c of closuresRes.data || []) closureByDate[c.closed_date] = c

  const volunteerIds = [...new Set((shiftsRes.data || []).map((s) => s.volunteer_id))]
  let namesById = {}
  if (volunteerIds.length) {
    const { data: people } = await admin.from('volunteers').select('id, name').in('id', volunteerIds)
    for (const p of people || []) namesById[p.id] = firstName(p.name)
  }

  const days = []
  let d = new Date(from + 'T12:00:00')
  const end = new Date(to + 'T12:00:00')
  while (d <= end) {
    const key = toDateStr(d)
    if (isWeekday(d)) {
      const closed = closureByDate[key]
      const shift = shiftByDate[key]
      const past = isPastDate(key)
      let status = 'open'
      if (closed) status = 'closed'
      else if (shift) status = 'covered'
      else if (past) status = 'past'

      days.push({
        date: key,
        status,
        arrival_time: shift ? String(shift.arrival_time).slice(0, 5) : null,
        volunteer_name: shift ? namesById[shift.volunteer_id] || 'Volunteer' : null,
        closed_reason: closed?.reason || '',
      })
    }
    d.setDate(d.getDate() + 1)
  }

  const countable = days.filter((day) => day.status !== 'closed')
  const covered = countable.filter((day) => day.status === 'covered').length
  const open = countable.filter((day) => day.status === 'open').length

  return NextResponse.json({
    days,
    covered,
    open,
    total: countable.length,
  })
}
