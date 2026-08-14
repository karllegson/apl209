import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getVolunteerSession, isSignedIn } from '@/lib/volunteer/auth'

export async function GET(request) {
  const session = getVolunteerSession(request)
  if (!isSignedIn(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.isAdmin && !session.volunteerId) {
    return NextResponse.json({
      isAdmin: true,
      volunteer: { id: null, name: 'Admin', email: 'administration@apl209.org' },
    })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const { data, error } = await admin
    .from('volunteers')
    .select('id, name, email, phone')
    .eq('id', session.volunteerId)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ isAdmin: session.isAdmin, volunteer: data })
}
