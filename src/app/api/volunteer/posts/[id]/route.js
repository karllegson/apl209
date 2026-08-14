import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession } from '@/lib/volunteer/auth'

async function loadPost(admin, id) {
  const { data, error } = await admin
    .from('volunteer_posts')
    .select('id, volunteer_id, status')
    .eq('id', id)
    .maybeSingle()
  return { data, error }
}

export async function PATCH(request, { params }) {
  const session = getVolunteerSession(request)
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const status = body.status
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data: post, error: loadError } = await loadPost(admin, id)
  if (loadError || !post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  const { error } = await admin
    .from('volunteer_posts')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, status })
}

export async function DELETE(request, { params }) {
  const session = getVolunteerSession(request)
  const { id } = await params

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data: post, error: loadError } = await loadPost(admin, id)
  if (loadError || !post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  const isOwner = session.volunteerId && post.volunteer_id === session.volunteerId
  if (!session.isAdmin && !(isOwner && post.status === 'pending')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await admin.from('volunteer_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
