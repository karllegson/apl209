import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession, isSignedIn } from '@/lib/volunteer/auth'
import { isPastDate, isValidArrivalTime, normalizeTime } from '@/lib/volunteer/dates'

const SHIFT_COLS = 'id, volunteer_id, shift_date, arrival_time, hours_worked, note'
const SHIFT_COLS_SAFE = 'id, volunteer_id, shift_date, arrival_time, hours_worked'

function sanitizeNote(value) {
  if (value == null) return ''
  return String(value).trim().slice(0, 140)
}

function shapeShift(data, session) {
  return {
    id: data.id,
    date: data.shift_date,
    arrival_time: String(data.arrival_time).slice(0, 5),
    hours_worked: data.hours_worked == null ? null : Number(data.hours_worked),
    note: typeof data.note === 'string' ? data.note : '',
    volunteer_id: data.volunteer_id,
    is_mine: data.volunteer_id === session.volunteerId,
  }
}

async function loadShift(admin, id) {
  let res = await admin.from('volunteer_shifts').select(SHIFT_COLS).eq('id', id).maybeSingle()
  if (res.error && (res.error.message || '').toLowerCase().includes('note')) {
    res = await admin.from('volunteer_shifts').select(SHIFT_COLS_SAFE).eq('id', id).maybeSingle()
  }
  return res
}

export async function PATCH(request, { params }) {
  const session = getVolunteerSession(request)
  if (!isSignedIn(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data: shift, error: loadError } = await loadShift(admin, id)
  if (loadError || !shift) {
    return NextResponse.json({ error: 'Shift not found.' }, { status: 404 })
  }
  if (!session.isAdmin && shift.volunteer_id !== session.volunteerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const patch = {}
  if (body.arrival_time != null) {
    const arrival_time = normalizeTime(body.arrival_time)
    if (!arrival_time) {
      return NextResponse.json({ error: 'Pick a valid arrival time.' }, { status: 400 })
    }
    if (!isValidArrivalTime(arrival_time)) {
      return NextResponse.json({ error: 'Arrival time must be between 8:00 AM and 4:00 PM.' }, { status: 400 })
    }
    if (!session.isAdmin && isPastDate(shift.shift_date)) {
      return NextResponse.json({ error: 'Cannot change time on a past day.' }, { status: 400 })
    }
    patch.arrival_time = `${arrival_time}:00`
  }
  if (body.hours_worked !== undefined) {
    if (body.hours_worked === null || body.hours_worked === '') {
      patch.hours_worked = null
    } else {
      const hours = Number(body.hours_worked)
      if (Number.isNaN(hours) || hours < 0 || hours > 16) {
        return NextResponse.json({ error: 'Hours must be between 0 and 16.' }, { status: 400 })
      }
      patch.hours_worked = Math.round(hours * 10) / 10
    }
  }
  if (body.note !== undefined) {
    patch.note = sanitizeNote(body.note)
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  let { data, error } = await admin
    .from('volunteer_shifts')
    .update(patch)
    .eq('id', id)
    .select(SHIFT_COLS)
    .single()

  if (error && (error.message || '').toLowerCase().includes('note')) {
    const { note: _note, ...rest } = patch
    if (!Object.keys(rest).length) {
      return NextResponse.json({ shift: shapeShift(shift, session) })
    }
    const retry = await admin.from('volunteer_shifts').update(rest).eq('id', id).select(SHIFT_COLS_SAFE).single()
    data = retry.data
    error = retry.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ shift: shapeShift(data, session) })
}

export async function DELETE(request, { params }) {
  const session = getVolunteerSession(request)
  if (!isSignedIn(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data: shift, error: loadError } = await loadShift(admin, id)
  if (loadError || !shift) {
    return NextResponse.json({ error: 'Shift not found.' }, { status: 404 })
  }
  if (!session.isAdmin && shift.volunteer_id !== session.volunteerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isAdmin && isPastDate(shift.shift_date)) {
    return NextResponse.json({ error: 'Cannot cancel a past day.' }, { status: 400 })
  }

  const { error } = await admin.from('volunteer_shifts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
