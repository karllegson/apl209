import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession, isSignedIn } from '@/lib/volunteer/auth'
import { todayStr } from '@/lib/volunteer/dates'

function monthStartStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

function summarize(shifts) {
  const today = todayStr()
  const monthStart = monthStartStr()
  const hours = (list) =>
    list.reduce((sum, s) => sum + (s.hours_worked == null ? 0 : Number(s.hours_worked)), 0)

  const upcoming = shifts.filter((s) => s.shift_date >= today)
  const thisMonth = shifts.filter((s) => s.shift_date >= monthStart)

  return {
    days_total: shifts.length,
    days_upcoming: upcoming.length,
    days_this_month: thisMonth.length,
    hours_total: Math.round(hours(shifts) * 10) / 10,
    hours_this_month: Math.round(hours(thisMonth) * 10) / 10,
  }
}

export async function GET(request) {
  const session = getVolunteerSession(request)
  if (!isSignedIn(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Personal stats only — admin-only login has no volunteer shifts to count
  if (!session.volunteerId) {
    return NextResponse.json({ stats: null })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data: shifts, error } = await admin
    .from('volunteer_shifts')
    .select('shift_date, hours_worked')
    .eq('volunteer_id', session.volunteerId)

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ error: 'Volunteer tables are not set up yet.' }, { status: 500 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ stats: summarize(shifts || []) })
}
