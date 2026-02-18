import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'

const ALLOWED_LINK_IDS = [
  'pricing-request-appointment',
  'pricing-back-to-home',
  'google-business',
]

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`track-click:${ip}`, { windowMs: 60 * 1000, max: 60 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {} }
      )
    }
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const linkId = typeof body?.linkId === 'string' ? body.linkId.trim() : ''
  const source = typeof body?.source === 'string' ? body.source.trim().slice(0, 100) : ''

  if (!linkId || !ALLOWED_LINK_IDS.includes(linkId)) {
    return NextResponse.json({ error: 'Invalid linkId' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('track-click Supabase error:', err.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const { error } = await admin.from('link_clicks').insert({
    link_id: linkId,
    source: source || null,
  })

  if (error) {
    console.error('track-click insert error:', error)
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
