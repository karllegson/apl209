import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { firstName, getVolunteerSession, isSignedIn } from '@/lib/volunteer/auth'
import { todayStr } from '@/lib/volunteer/dates'

const SHIFT_COLS = 'id, volunteer_id, shift_date, arrival_time, hours_worked, note'
const SHIFT_COLS_SAFE = 'id, volunteer_id, shift_date, arrival_time, hours_worked'

function publicName(fullName, isMine, isAdmin) {
  if (isAdmin || isMine) return fullName || 'Volunteer'
  return firstName(fullName)
}

function shapeShift(s, session) {
  const isMine = s.volunteer_id === session.volunteerId
  return {
    id: s.id,
    date: s.shift_date,
    arrival_time: String(s.arrival_time).slice(0, 5),
    hours_worked: s.hours_worked == null ? null : Number(s.hours_worked),
    note: (session.isAdmin || isMine) && typeof s.note === 'string' ? s.note : '',
    volunteer_name: null,
    is_mine: isMine,
    volunteer_id: session.isAdmin || isMine ? s.volunteer_id : undefined,
  }
}

async function selectShifts(admin, build) {
  let q = build(admin.from('volunteer_shifts').select(SHIFT_COLS))
  let res = await q
  if (res.error && (res.error.message || '').toLowerCase().includes('note')) {
    q = build(admin.from('volunteer_shifts').select(SHIFT_COLS_SAFE))
    res = await q
  }
  return res
}

export async function GET(request) {
  const session = getVolunteerSession(request)
  if (!isSignedIn(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  const today = todayStr()
  const lookback = new Date()
  lookback.setDate(lookback.getDate() - 14)
  const lookbackStr = `${lookback.getFullYear()}-${String(lookback.getMonth() + 1).padStart(2, '0')}-${String(lookback.getDate()).padStart(2, '0')}`
  const lookahead = new Date()
  lookahead.setDate(lookahead.getDate() + 60)
  const lookaheadStr = `${lookahead.getFullYear()}-${String(lookahead.getMonth() + 1).padStart(2, '0')}-${String(lookahead.getDate()).padStart(2, '0')}`

  const [shiftsRes, closuresRes, announcementsRes, volunteersRes, mineRes] = await Promise.all([
    selectShifts(admin, (q) =>
      q.gte('shift_date', from).lte('shift_date', to).order('shift_date', { ascending: true })
    ),
    admin
      .from('volunteer_closures')
      .select('id, closed_date, reason')
      .gte('closed_date', from)
      .lte('closed_date', to)
      .order('closed_date', { ascending: true }),
    admin
      .from('volunteer_announcements')
      .select('id, message, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    session.isAdmin
      ? admin.from('volunteers').select('id, name, email, phone').order('name', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    session.volunteerId
      ? selectShifts(admin, (q) =>
          q
            .eq('volunteer_id', session.volunteerId)
            .gte('shift_date', lookbackStr)
            .lte('shift_date', lookaheadStr)
            .order('shift_date', { ascending: true })
        )
      : Promise.resolve({ data: [], error: null }),
  ])

  if (shiftsRes.error?.code === '42P01') {
    return NextResponse.json({ error: 'Volunteer tables are not set up yet. Run supabase/volunteer.sql.' }, { status: 500 })
  }
  if (shiftsRes.error) return NextResponse.json({ error: shiftsRes.error.message }, { status: 500 })
  if (closuresRes.error) return NextResponse.json({ error: closuresRes.error.message }, { status: 500 })
  if (announcementsRes.error) return NextResponse.json({ error: announcementsRes.error.message }, { status: 500 })

  const volunteerIds = [...new Set((shiftsRes.data || []).map((s) => s.volunteer_id))]
  let namesById = {}
  if (volunteerIds.length) {
    const { data: people } = await admin.from('volunteers').select('id, name').in('id', volunteerIds)
    for (const p of people || []) namesById[p.id] = p.name
  }

  const shifts = (shiftsRes.data || []).map((s) => {
    const shaped = shapeShift(s, session)
    const isMine = s.volunteer_id === session.volunteerId
    shaped.volunteer_name = publicName(namesById[s.volunteer_id], isMine, session.isAdmin)
    return shaped
  })

  const mine = (mineRes.data || []).map((s) => {
    const shaped = shapeShift(s, session)
    shaped.volunteer_name = publicName('', true, session.isAdmin)
    return shaped
  })

  const hoursDue = mine.filter((s) => s.date < today && s.hours_worked == null)
  const myUpcoming = mine.filter((s) => s.date >= today)
  const todayShift = mine.find((s) => s.date === today) || null

  const closures = (closuresRes.data || []).map((c) => ({
    id: c.id,
    date: c.closed_date,
    reason: c.reason || '',
  }))

  return NextResponse.json({
    isAdmin: session.isAdmin,
    shifts,
    closures,
    announcements: announcementsRes.data || [],
    volunteers: session.isAdmin ? volunteersRes.data || [] : undefined,
    hoursDue,
    myUpcoming,
    todayShift,
  })
}
