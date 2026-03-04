import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated } from '@/lib/auth/admin'

const FLAG_KEY = 'tnr_waitlist_enabled'

async function readFlag() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('feature_flags')
    .select('enabled')
    .eq('key', FLAG_KEY)
    .maybeSingle()
  if (error && error.code !== '42P01') {
    console.error('feature_flags read error:', error)
  }
  if (!data || error) {
    // default: enabled when table or row missing
    return true
  }
  return Boolean(data.enabled)
}

export async function GET() {
  try {
    const enabled = await readFlag()
    return NextResponse.json({ enabled })
  } catch (err) {
    console.error('tnr-settings GET error:', err)
    // Fail-open: keep waitlist available if settings error
    return NextResponse.json({ enabled: true })
  }
}

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const enabled = Boolean(body?.enabled)
    const admin = createAdminClient()
    const { error } = await admin
      .from('feature_flags')
      .upsert({ key: FLAG_KEY, enabled }, { onConflict: 'key' })
    if (error) {
      console.error('feature_flags upsert error:', error)
      return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
    }
    return NextResponse.json({ enabled })
  } catch (err) {
    console.error('tnr-settings POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

