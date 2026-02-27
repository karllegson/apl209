import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'
import { isAdminAuthenticated } from '@/lib/auth/admin'

const MAX_BODY_BYTES = 2 * 1024 * 1024 // 2MB (optional photo)

// GET — List TNR waitlist entries (admin only)
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
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }
  const limit = Math.min(Math.max(1, parseInt(new URL(request.url).searchParams.get('limit') || '50', 10)), 200)
  const movedParam = new URL(request.url).searchParams.get('moved')
  let query = admin
    .from('tnr_waitlist')
    .select('id, first_name, last_name, email, phone, animal_type, photo_url, customer_notes, moved_to_tnr, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (movedParam === '0' || movedParam === 'false') query = query.eq('moved_to_tnr', false)
  else if (movedParam === '1' || movedParam === 'true') query = query.eq('moved_to_tnr', true)
  const { data, error } = await query
  if (error) {
    if (error.code === '42P01') return NextResponse.json({ waitlist: [] })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ waitlist: data || [] })
}

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  const isAdmin = devMode || isAdminAuthenticated(request)
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`tnr-waitlist:${ip}`, { windowMs: 60 * 60 * 1000, max: 20 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {} }
      )
    }
    const cl = request.headers.get('content-length')
    if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json(
      { error: 'Server configuration error.' },
      { status: 500 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const first_name = typeof body.first_name === 'string' ? body.first_name.trim().slice(0, 200) : ''
  const last_name = typeof body.last_name === 'string' ? body.last_name.trim().slice(0, 200) : ''
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 50) : ''
  const animal_type =
    typeof body.animal_type === 'string' && ['cat', 'dog'].includes(body.animal_type.trim().toLowerCase())
      ? body.animal_type.trim().toLowerCase()
      : ''
  const photo_url = typeof body.photo_url === 'string' && body.photo_url.trim().startsWith('data:') ? body.photo_url.trim().slice(0, 2 * 1024 * 1024) : null
  const customer_notes = typeof body.customer_notes === 'string' ? body.customer_notes.trim().slice(0, 2000) : ''
  const wantsMoved = body && body.moved_to_tnr === true
  const moved_to_tnr = isAdmin && wantsMoved ? true : false

  if (!first_name || !last_name || !email || !phone) {
    return NextResponse.json({ error: 'First name, last name, email, and phone are required.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('tnr_waitlist')
    .insert({
      first_name,
      last_name,
      email,
      phone,
      animal_type,
      photo_url: photo_url || null,
      customer_notes: customer_notes || null,
      moved_to_tnr,
    })
    .select('id, created_at')
    .single()

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'TNR waitlist is not set up yet. Please add the tnr_waitlist table in Supabase.' },
        { status: 503 }
      )
    }
    console.error('tnr-waitlist insert error:', error)
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, created_at: data.created_at }, { status: 201 })
}
