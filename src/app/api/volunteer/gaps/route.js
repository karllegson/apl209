import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession, isSignedIn } from '@/lib/volunteer/auth'
import { isWeekday, toDateStr } from '@/lib/volunteer/dates'

function upcomingWeekdays(fromDate, count) {
  const days = []
  const d = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  let guard = 0
  while (days.length < count && guard < 90) {
    if (isWeekday(d)) days.push(toDateStr(d))
    d.setDate(d.getDate() + 1)
    guard += 1
  }
  return days
}

export async function GET(request) {
  const session = getVolunteerSession(request)
  if (!isSignedIn(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const candidates = upcomingWeekdays(new Date(), 40)
  const from = candidates[0]
  const to = candidates[candidates.length - 1]

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const [shiftsRes, closuresRes] = await Promise.all([
    admin.from('volunteer_shifts').select('shift_date').gte('shift_date', from).lte('shift_date', to),
    admin.from('volunteer_closures').select('closed_date').gte('closed_date', from).lte('closed_date', to),
  ])

  if (shiftsRes.error) {
    if (shiftsRes.error.code === '42P01') {
      return NextResponse.json({ error: 'Volunteer tables are not set up yet.' }, { status: 500 })
    }
    return NextResponse.json({ error: shiftsRes.error.message }, { status: 500 })
  }

  const taken = new Set((shiftsRes.data || []).map((s) => s.shift_date))
  const closed = new Set((closuresRes.data || []).map((c) => c.closed_date))
  const open = candidates.filter((day) => !taken.has(day) && !closed.has(day)).slice(0, 8)

  return NextResponse.json({ open })
}
