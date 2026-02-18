import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

// GET — List attempted (admin only). Optional ?includeMatches=1 to attach suggested appointments by phone.
export async function GET(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json(
      { error: 'Server configuration error.', details: process.env.NODE_ENV === 'development' ? err.message : undefined },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const includeMatches = searchParams.get('includeMatches') === '1'
  const statusParam = searchParams.get('status')
  const allowed = ['pending', 'confirmed', 'attempted', 'cancelled', 'completed']

  let query = admin.from('standby_appointments').select('*').order('created_at', { ascending: false })
  if (statusParam) {
    const statuses = statusParam.split(',').map((s) => s.trim()).filter((s) => allowed.includes(s))
    if (statuses.length === 1) {
      query = query.eq('status', statuses[0])
    } else if (statuses.length > 1) {
      query = query.in('status', statuses)
    }
  }
  const { data: list, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!includeMatches || !list?.length) {
    return NextResponse.json({ attempted: list || [] })
  }

  const phones = [...new Set(list.map((s) => (s.phone || '').trim()).filter(Boolean))]
  if (phones.length === 0) {
    return NextResponse.json({ attempted: list })
  }

  const { data: appointments } = await admin
    .from('appointments')
    .select('id, owner_phone, owner_first_name, owner_last_name, owner_name, created_at')
    .in('owner_phone', phones)

  const byPhone = {}
  for (const a of appointments || []) {
    const p = (a.owner_phone || '').trim()
    if (!byPhone[p]) byPhone[p] = []
    byPhone[p].push(a)
  }

  const attempted = list.map((s) => ({
    ...s,
    suggestedAppointments: byPhone[(s.phone || '').trim()] || [],
  }))

  return NextResponse.json({ attempted })
}

// POST — Create attempted entry (admin only)
export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json(
      { error: 'Server configuration error.', details: process.env.NODE_ENV === 'development' ? err.message : undefined },
      { status: 500 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const first_name = typeof body.first_name === 'string' ? body.first_name.trim().slice(0, 200) : ''
  const last_name = typeof body.last_name === 'string' ? body.last_name.trim().slice(0, 200) : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 50) : ''
  const appointment_type = typeof body.appointment_type === 'string' ? body.appointment_type.trim().slice(0, 200) : ''
  const standby_date = body.standby_date && /^\d{4}-\d{2}-\d{2}$/.test(String(body.standby_date).slice(0, 10))
    ? String(body.standby_date).slice(0, 10)
    : null
  const scheduled_date = body.scheduled_date && /^\d{4}-\d{2}-\d{2}$/.test(String(body.scheduled_date).slice(0, 10))
    ? String(body.scheduled_date).slice(0, 10)
    : null

  const { data, error } = await admin
    .from('standby_appointments')
    .insert({
      first_name,
      last_name,
      phone,
      standby_date: standby_date || null,
      appointment_type,
      scheduled_date: scheduled_date || null,
      status: 'attempted',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ attempted: data })
}
