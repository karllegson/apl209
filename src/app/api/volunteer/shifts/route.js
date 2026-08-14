import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession, isSignedIn } from '@/lib/volunteer/auth'
import { isPastDate, isWeekday, normalizeTime } from '@/lib/volunteer/dates'

function sanitizeNote(value) {
  if (value == null) return ''
  return String(value).trim().slice(0, 140)
}

function shapeShift(data, session, note = '') {
  return {
    id: data.id,
    date: data.shift_date,
    arrival_time: String(data.arrival_time).slice(0, 5),
    hours_worked: data.hours_worked == null ? null : Number(data.hours_worked),
    note,
    volunteer_id: data.volunteer_id,
    is_mine: data.volunteer_id === session.volunteerId,
  }
}

export async function POST(request) {
  const session = getVolunteerSession(request)
  if (!isSignedIn(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const date = typeof body.date === 'string' ? body.date.trim() : ''
  const arrival_time = normalizeTime(body.arrival_time)
  const volunteerId = session.isAdmin && body.volunteer_id ? body.volunteer_id : session.volunteerId
  const note = sanitizeNote(body.note)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Pick a valid day.' }, { status: 400 })
  }
  if (!arrival_time) {
    return NextResponse.json({ error: 'Pick an arrival time.' }, { status: 400 })
  }
  if (!volunteerId) {
    return NextResponse.json({ error: 'Admin: pick a volunteer to assign.' }, { status: 400 })
  }
  if (!isWeekday(date)) {
    return NextResponse.json({ error: 'Laundry volunteers are needed on weekdays only.' }, { status: 400 })
  }
  if (!session.isAdmin && isPastDate(date)) {
    return NextResponse.json({ error: 'That day already passed.' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data: closed } = await admin
    .from('volunteer_closures')
    .select('id, reason')
    .eq('closed_date', date)
    .maybeSingle()
  if (closed) {
    return NextResponse.json(
      { error: closed.reason ? `Clinic closed: ${closed.reason}` : 'Clinic is closed that day.' },
      { status: 409 }
    )
  }

  const row = {
    volunteer_id: volunteerId,
    shift_date: date,
    arrival_time: `${arrival_time}:00`,
    note,
  }

  let { data, error } = await admin
    .from('volunteer_shifts')
    .insert(row)
    .select('id, volunteer_id, shift_date, arrival_time, hours_worked, note')
    .single()

  if (error && (error.message || '').toLowerCase().includes('note')) {
    const { note: _note, ...rest } = row
    const retry = await admin
      .from('volunteer_shifts')
      .insert(rest)
      .select('id, volunteer_id, shift_date, arrival_time, hours_worked')
      .single()
    data = retry.data
    error = retry.error
  }

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That day was just taken. Pick another.' }, { status: 409 })
    }
    if (error.code === '42P01') {
      return NextResponse.json({ error: 'Volunteer tables are not set up yet.' }, { status: 500 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    shift: shapeShift(data, session, typeof data.note === 'string' ? data.note : note),
  })
}
