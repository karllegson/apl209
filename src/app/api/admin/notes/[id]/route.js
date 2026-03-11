import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

function getAdminClient() {
  try {
    return createAdminClient()
  } catch (err) {
    console.error('Supabase admin client error:', err.message)
    return null
  }
}

export async function PATCH(request, { params }) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Note id required' }, { status: 400 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server configuration error. Check Supabase credentials.' },
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
  if (typeof body.text === 'string') {
    const trimmed = body.text.trim()
    if (!trimmed) {
      const { error: delError } = await admin.from('admin_notes').delete().eq('id', id)
      if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })
      return NextResponse.json({ deleted: true })
    }
    updates.text = trimmed
  }
  if (typeof body.checked === 'boolean') {
    updates.checked = body.checked
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('admin_notes')
    .update(updates)
    .eq('id', id)
    .select('id, text, checked, created_at, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  return NextResponse.json({
    note: {
      id: data.id,
      text: data.text,
      checked: !!data.checked,
      createdAt: data.created_at,
    },
  })
}

export async function DELETE(request, { params }) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Note id required' }, { status: 400 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server configuration error. Check Supabase credentials.' },
      { status: 500 }
    )
  }

  const { error } = await admin.from('admin_notes').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
