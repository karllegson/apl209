import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'
import { ALLOWED_LINK_IDS, TRACK_REDIRECT_PATH } from '@/lib/trackedLinkIds'

/**
 * GET /t/[linkId] — Track a click then redirect to the form.
 * Use this URL as the href on your other website: https://yoursite.com/t/pricing-request-appointment
 */
export async function GET(request, { params }) {
  const linkId = typeof params?.linkId === 'string' ? params.linkId.trim() : ''
  if (!linkId || !ALLOWED_LINK_IDS.includes(linkId)) {
    return NextResponse.redirect(new URL(TRACK_REDIRECT_PATH, request.url))
  }

  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`t:${linkId}:${ip}`, { windowMs: 60 * 1000, max: 60 })
    if (!rl.ok) {
      return NextResponse.redirect(new URL(TRACK_REDIRECT_PATH, request.url))
    }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('t/[linkId] Supabase error:', err.message)
    return NextResponse.redirect(new URL(TRACK_REDIRECT_PATH, request.url))
  }

  const { error } = await admin.from('link_clicks').insert({
    link_id: linkId,
    source: 'href',
  })

  if (error) {
    console.error('t/[linkId] insert error:', error)
  }

  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('to') || TRACK_REDIRECT_PATH
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
