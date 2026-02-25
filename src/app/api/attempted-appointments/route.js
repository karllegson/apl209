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

  // Fetch all matching rows (no pagination cap so attempted page shows everything)
  let query = admin
    .from('standby_appointments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10000)
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

  // Ensure every appointment with status=attempted has a standby row so it shows on attempted page
  const { data: attemptedAppointments } = await admin
    .from('appointments')
    .select('id, owner_first_name, owner_last_name, owner_name, owner_phone, requested_service')
    .eq('status', 'attempted')
  const attemptedIds = (attemptedAppointments || []).map((a) => a.id)
  let didInsert = false
  if (attemptedIds.length > 0) {
    const { data: existingStandby } = await admin
      .from('standby_appointments')
      .select('source_appointment_id')
      .in('source_appointment_id', attemptedIds)
    const existingIds = new Set((existingStandby || []).map((s) => s.source_appointment_id).filter(Boolean))
    for (const apt of attemptedAppointments || []) {
      if (existingIds.has(apt.id)) continue
      const first = (apt.owner_first_name || '').trim() || (apt.owner_name || '').trim().split(/\s+/)[0] || ''
      const last = (apt.owner_last_name || '').trim() || (apt.owner_name || '').trim().split(/\s+/).slice(1).join(' ') || ''
      await admin.from('standby_appointments').insert({
        first_name: first.slice(0, 200),
        last_name: last.slice(0, 200),
        phone: (apt.owner_phone || '').trim().slice(0, 50),
        appointment_type: (apt.requested_service || '').trim().slice(0, 200),
        status: 'attempted',
        source_appointment_id: apt.id,
      })
      didInsert = true
    }
  }

  let listFiltered = list || []
  if (didInsert) {
    const statusFilter = statusParam
      ? statusParam.split(',').map((s) => s.trim()).filter((s) => allowed.includes(s))[0]
      : null
    let refetch = admin.from('standby_appointments').select('*').order('created_at', { ascending: false }).limit(10000)
    if (statusFilter) refetch = refetch.eq('status', statusFilter)
    const { data: refetched } = await refetch
    listFiltered = refetched || []
  }

  // Hide standby rows whose linked appointment is already confirmed/cancelled/completed (they shouldn't show on attempted page)
  const linkedIds = [...new Set(
    (listFiltered || [])
      .flatMap((s) => [s.source_appointment_id, s.merged_appointment_id].filter(Boolean))
  )]
  if (linkedIds.length > 0) {
    const { data: linkedAppointments } = await admin
      .from('appointments')
      .select('id, status')
      .in('id', linkedIds)
    const resolvedStatus = new Set(
      (linkedAppointments || []).filter((a) => ['confirmed', 'cancelled', 'completed'].includes(a.status)).map((a) => a.id)
    )
    listFiltered = listFiltered.filter((s) => {
      const srcId = s.source_appointment_id || s.merged_appointment_id
      return !srcId || !resolvedStatus.has(srcId)
    })
  }

  if (!includeMatches || !listFiltered?.length) {
    return NextResponse.json({ attempted: listFiltered })
  }

  const phones = [...new Set(listFiltered.map((s) => (s.phone || '').trim()).filter(Boolean))]
  if (phones.length === 0) {
    return NextResponse.json({ attempted: listFiltered })
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

  const attempted = listFiltered.map((s) => ({
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
