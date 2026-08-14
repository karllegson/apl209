import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { firstName, getVolunteerSession, isSignedIn } from '@/lib/volunteer/auth'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'

function shapePost(row, { isAdmin, volunteerId }) {
  const isMine = !!(volunteerId && row.volunteer_id === volunteerId)
  return {
    id: row.id,
    title: row.title || '',
    body: row.body,
    status: row.status,
    is_admin: !!row.is_admin,
    is_mine: isMine,
    author_name: row.is_admin ? 'APL' : firstName(row.author_name) || 'Volunteer',
    created_at: row.created_at,
  }
}

export async function GET(request) {
  const session = getVolunteerSession(request)

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data, error } = await admin
    .from('volunteer_posts')
    .select('id, volunteer_id, author_name, is_admin, title, body, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ error: 'Board is not set up yet. Run supabase/volunteer-board.sql.' }, { status: 500 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = data || []
  const visible = rows.filter((row) => {
    if (row.status === 'approved') return true
    if (session.isAdmin) return true
    if (session.volunteerId && row.volunteer_id === session.volunteerId) return true
    return false
  })

  return NextResponse.json({
    isAdmin: !!session.isAdmin,
    signedIn: isSignedIn(session),
    posts: visible.map((row) => shapePost(row, session)),
  })
}

export async function POST(request) {
  const session = getVolunteerSession(request)
  if (!isSignedIn(session)) {
    return NextResponse.json({ error: 'Sign in to post.' }, { status: 401 })
  }

  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`volunteer-post:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many posts. Try again later.' },
        { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {} }
      )
    }
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : ''
  const text = typeof body.body === 'string' ? body.body.trim().slice(0, 2000) : ''
  if (!text) {
    return NextResponse.json({ error: 'Write a message to post.' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  let author_name = 'Admin'
  if (!session.isAdmin) {
    const { data: person } = await admin
      .from('volunteers')
      .select('name')
      .eq('id', session.volunteerId)
      .maybeSingle()
    author_name = person?.name || 'Volunteer'
  }

  const { data, error } = await admin
    .from('volunteer_posts')
    .insert({
      volunteer_id: session.volunteerId || null,
      author_name,
      is_admin: !!session.isAdmin,
      title,
      body: text,
      status: session.isAdmin ? 'approved' : 'pending',
      reviewed_at: session.isAdmin ? new Date().toISOString() : null,
    })
    .select('id, volunteer_id, author_name, is_admin, title, body, status, created_at')
    .single()

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ error: 'Board is not set up yet. Run supabase/volunteer-board.sql.' }, { status: 500 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post: shapePost(data, session) })
}
