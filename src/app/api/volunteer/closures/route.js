import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession } from '@/lib/volunteer/auth'

export async function POST(request) {
  const session = getVolunteerSession(request)
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const date = typeof body.date === 'string' ? body.date.trim() : ''
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 200) : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Pick a valid day.' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  await admin.from('volunteer_shifts').delete().eq('shift_date', date)

  const { data, error } = await admin
    .from('volunteer_closures')
    .upsert({ closed_date: date, reason }, { onConflict: 'closed_date' })
    .select('id, closed_date, reason')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    closure: { id: data.id, date: data.closed_date, reason: data.reason || '' },
  })
}

export async function DELETE(request) {
  const session = getVolunteerSession(request)
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = new URL(request.url).searchParams.get('date')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { error } = await admin.from('volunteer_closures').delete().eq('closed_date', date)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
