import { NextResponse } from 'next/server'
import { getAdminPassword } from '@/lib/auth/admin'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'

const ADMIN_COOKIE = 'apl_admin_session'

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`admin-login:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again later.' },
        { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {} }
      )
    }
  }
  try {
    const body = await request.json()
    const password = body?.password
    const correctPassword = getAdminPassword()

    if (typeof password === 'string' && password === correctPassword) {
      const response = NextResponse.json({ success: true })
      response.cookies.set(ADMIN_COOKIE, '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
