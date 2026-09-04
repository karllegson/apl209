import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession } from '@/lib/volunteer/auth'
import { todayStr } from '@/lib/volunteer/dates'

const SHIFT_COLS =
  'id, volunteer_id, shift_date, arrival_time, hours_worked, note, created_at'
const SHIFT_COLS_SAFE =
  'id, volunteer_id, shift_date, arrival_time, hours_worked, created_at'

async function selectShifts(admin) {
  let res = await admin
    .from('volunteer_shifts')
    .select(SHIFT_COLS)
    .order('shift_date', { ascending: false })
  if (res.error && (res.error.message || '').toLowerCase().includes('note')) {
    res = await admin
      .from('volunteer_shifts')
      .select(SHIFT_COLS_SAFE)
      .order('shift_date', { ascending: false })
  }
  return res
}

export async function GET(request) {
  const session = getVolunteerSession(request)
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const [volunteersRes, shiftsRes] = await Promise.all([
    admin
      .from('volunteers')
      .select('id, name, email, phone, phone_normalized, created_at, updated_at')
      .order('created_at', { ascending: false }),
    selectShifts(admin),
  ])

  if (volunteersRes.error) {
    if (volunteersRes.error.code === '42P01') {
      return NextResponse.json({ error: 'Volunteer tables are not set up yet.' }, { status: 500 })
    }
    return NextResponse.json({ error: volunteersRes.error.message }, { status: 500 })
  }
  if (shiftsRes.error) {
    return NextResponse.json({ error: shiftsRes.error.message }, { status: 500 })
  }

  const today = todayStr()
  const shiftsByVolunteer = {}
  for (const shift of shiftsRes.data || []) {
    if (!shiftsByVolunteer[shift.volunteer_id]) shiftsByVolunteer[shift.volunteer_id] = []
    shiftsByVolunteer[shift.volunteer_id].push({
      ...shift,
      note: typeof shift.note === 'string' ? shift.note : '',
    })
  }

  const users = (volunteersRes.data || []).map((v) => {
    const shifts = shiftsByVolunteer[v.id] || []
    const upcoming = shifts.filter((s) => s.shift_date >= today)
    const past = shifts.filter((s) => s.shift_date < today)
    const hours = shifts.reduce((sum, s) => sum + (Number(s.hours_worked) || 0), 0)
    return {
      ...v,
      shift_count: shifts.length,
      upcoming_count: upcoming.length,
      past_count: past.length,
      total_hours: Math.round(hours * 10) / 10,
      shifts,
    }
  })

  return NextResponse.json({
    users,
    total: users.length,
    total_shifts: (shiftsRes.data || []).length,
  })
}
