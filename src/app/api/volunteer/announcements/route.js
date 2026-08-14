import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession } from '@/lib/volunteer/auth'

export async function POST(request) {
  const session = getVolunteerSession(request)
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : ''
  if (!message) {
    return NextResponse.json({ error: 'Enter an announcement.' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data, error } = await admin
    .from('volunteer_announcements')
    .insert({ message })
    .select('id, message, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ announcement: data })
}

export async function DELETE(request) {
  const session = getVolunteerSession(request)
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { error } = await admin.from('volunteer_announcements').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
