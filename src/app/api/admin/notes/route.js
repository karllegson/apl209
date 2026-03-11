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

export async function GET(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server configuration error. Check Supabase credentials.' },
      { status: 500 }
    )
  }

  const { data, error } = await admin
    .from('admin_notes')
    .select('id, text, checked, sort_order, created_at, updated_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const notes = (data || []).map((row) => ({
    id: row.id,
    text: row.text || '',
    checked: !!row.checked,
    createdAt: row.created_at,
  }))

  return NextResponse.json({ notes })
}

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  const { data: maxRow } = await admin
    .from('admin_notes')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxRow?.sort_order ?? -1) + 1

  const { data, error } = await admin
    .from('admin_notes')
    .insert({ text, checked: false, sort_order: sortOrder })
    .select('id, text, checked, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      note: {
        id: data.id,
        text: data.text,
        checked: !!data.checked,
        createdAt: data.created_at,
      },
    },
    { status: 201 }
  )
}
