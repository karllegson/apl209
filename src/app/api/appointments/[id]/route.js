import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

// GET — Get a single submission by ID (admin only)
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
      {
        error: 'Server configuration error. Please check Supabase credentials.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }

  const { data, error } = await admin
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Submission not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ appointment: data })
}

// PATCH — Update a submission (admin only)
export async function PATCH(request, { params }) {
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
      {
        error: 'Server configuration error. Please check Supabase credentials.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const allowedFields = [
    'status',
    'admin_notes',
    'owner_name',
    'owner_first_name',
    'owner_last_name',
    'owner_phone',
    'owner_email',
    'emergency_contact_name',
    'emergency_contact_phone',
    'preferred_contact',
    'street_address',
    'city',
    'state',
    'zip_code',
    'how_heard',
    'num_pets',
    'pets',
    'wants_microchip',
    'wants_nail_trim',
    'wants_flea_treatment',
    'optional_vaccines',
    'optional_wellness_services',
    'deposit_acknowledged',
    'deposit_card_last4',
    'deposit_card_expiry',
    'deposit_billing_zip',
    'is_returning_customer',
    'vet_note',
    'status_changed_by',
    'status_changed_at',
  ]
  const updates = {}

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] === 'string') {
        updates[field] = field === 'vet_note' ? body[field].trim().slice(0, 2000) : body[field].trim()
      } else {
        updates[field] = body[field]
      }
    }
  }

  if (updates.owner_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.owner_email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (updates.pets !== undefined && !Array.isArray(updates.pets)) {
    return NextResponse.json({ error: 'pets must be an array' }, { status: 400 })
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    )
  }

  const validStatuses = [
    'pending',
    'confirmed',
    'completed',
    'attempted',
    'cancelled',
    'no-show',
    'tnr',
  ]
  if (updates.status && !validStatuses.includes(updates.status)) {
    return NextResponse.json(
      { error: 'Invalid status value' },
      { status: 400 }
    )
  }

  if (updates.status) {
    updates.status_changed_at = new Date().toISOString()
    if (body.status_changed_by != null && typeof body.status_changed_by === 'string') {
      updates.status_changed_by = body.status_changed_by.trim().slice(0, 200)
    }
  }

  const { data, error } = await admin
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (updates.status === 'attempted' && data) {
    const first = (data.owner_first_name || '').trim() || (data.owner_name || '').trim().split(/\s+/)[0] || ''
    const last = (data.owner_last_name || '').trim() || (data.owner_name || '').trim().split(/\s+/).slice(1).join(' ') || ''
    const payload = {
      first_name: first.slice(0, 200),
      last_name: last.slice(0, 200),
      phone: (data.owner_phone || '').trim().slice(0, 50),
      appointment_type: (data.requested_service || '').trim().slice(0, 200),
      status: 'attempted',
    }
    const { data: existing } = await admin
      .from('standby_appointments')
      .select('id')
      .eq('source_appointment_id', id)
      .limit(1)
      .maybeSingle()
    if (existing) {
      await admin.from('standby_appointments').update(payload).eq('id', existing.id)
    } else {
      await admin.from('standby_appointments').insert({
        ...payload,
        source_appointment_id: id,
      })
    }
  }

  if (updates.status === 'pending') {
    await admin.from('standby_appointments').delete().eq('source_appointment_id', id)
  }

  // When appointment is confirmed/cancelled/completed/no-show/tnr, sync linked standby rows so they leave the attempted list
  if (updates.status && ['confirmed', 'cancelled', 'completed', 'no-show', 'tnr'].includes(updates.status)) {
    const staffName = body.status_changed_by != null && typeof body.status_changed_by === 'string'
      ? body.status_changed_by.trim().slice(0, 200)
      : ''
    const payload = {
      status: updates.status,
      status_changed_by: staffName,
      status_changed_at: updates.status_changed_at || new Date().toISOString(),
    }
    await admin.from('standby_appointments').update(payload).eq('source_appointment_id', id)
    await admin.from('standby_appointments').update(payload).eq('merged_appointment_id', id)
  }

  return NextResponse.json({ appointment: data })
}

// DELETE — Delete a submission (admin only)
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
      {
        error: 'Server configuration error. Please check Supabase credentials.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }

  const { error } = await admin.from('appointments').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
