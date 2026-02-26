import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

// PATCH — set moved_to_tnr (admin only). Body: { moved_to_tnr: true | false }
export async function PATCH(request, { params }) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  let body
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const movedToTnr = body && typeof body.moved_to_tnr === 'boolean' ? body.moved_to_tnr : true
  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
  const { data, error } = await admin
    .from('tnr_waitlist')
    .update({ moved_to_tnr: movedToTnr })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ entry: data })
}

// DELETE — remove TNR waitlist entry (admin only)
export async function DELETE(request, { params }) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
  const { error } = await admin.from('tnr_waitlist').delete().eq('id', id)
  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
