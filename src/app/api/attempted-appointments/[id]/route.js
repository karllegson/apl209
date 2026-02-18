import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

const STAFF_COOKIE = 'apl_staff_name'
const ALLOWED_STATUS = ['pending', 'confirmed', 'attempted', 'cancelled', 'completed']

// GET — Single attempted entry (admin only)
export async function GET(request, { params }) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
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

  const { data, error } = await admin.from('standby_appointments').select('*').eq('id', id).single()
  if (error || !data) {
    return NextResponse.json({ error: 'Attempted entry not found' }, { status: 404 })
  }
  return NextResponse.json({ attempted: data })
}

// PATCH — Update status or merge (admin only)
export async function PATCH(request, { params }) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const staffName = request.cookies.get(STAFF_COOKIE)?.value || ''

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

  const updates = {}

  if (body.status !== undefined) {
    const s = String(body.status).toLowerCase()
    if (ALLOWED_STATUS.includes(s)) {
      updates.status = s
      updates.status_changed_by = staffName
      updates.status_changed_at = new Date().toISOString()
    }
  }

  if (body.merged_appointment_id !== undefined) {
    updates.merged_appointment_id = body.merged_appointment_id === null || body.merged_appointment_id === ''
      ? null
      : body.merged_appointment_id
  }

  const textField = (v) => (typeof v === 'string' ? v.trim().slice(0, 200) : '')
  if (body.first_name !== undefined) updates.first_name = textField(body.first_name)
  if (body.last_name !== undefined) updates.last_name = textField(body.last_name)
  if (body.phone !== undefined) updates.phone = (typeof body.phone === 'string' ? body.phone.trim() : '').slice(0, 50)
  if (body.appointment_type !== undefined) updates.appointment_type = textField(body.appointment_type)

  const dateValue = (v) => {
    if (v == null || v === '') return null
    const s = String(v).trim().slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
  }
  if (body.standby_date !== undefined) updates.standby_date = dateValue(body.standby_date)
  if (body.scheduled_date !== undefined) updates.scheduled_date = dateValue(body.scheduled_date)

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid updates' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('standby_appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data?.source_appointment_id && updates.status) {
    const apptStatus = updates.status
    const allowedAppt = ['pending', 'confirmed', 'completed', 'attempted', 'cancelled', 'no-show']
    if (allowedAppt.includes(apptStatus)) {
      await admin
        .from('appointments')
        .update({
          status: apptStatus,
          status_changed_by: staffName,
          status_changed_at: new Date().toISOString(),
        })
        .eq('id', data.source_appointment_id)
    }
  }

  return NextResponse.json({ attempted: data })
}

// DELETE — Remove attempted entry (admin only)
export async function DELETE(request, { params }) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
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

  const { error } = await admin.from('standby_appointments').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
