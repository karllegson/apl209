import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'
import { buildIntakeAnalytics } from '@/lib/analytics/intakeAnalytics'

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
    .select('id, status, created_at, how_heard, city, state, zip_code')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('analytics appointments fetch error:', error)
    return NextResponse.json({ error: 'Failed to load intake analytics' }, { status: 500 })
  }

  const analytics = buildIntakeAnalytics(data || [])

  return NextResponse.json({ analytics })
}
