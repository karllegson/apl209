import { NextResponse } from 'next/server'
import { getAdminPassword } from '@/lib/auth/admin'

const ADMIN_COOKIE = 'apl_admin_session'

export async function POST(request) {
  try {
    const { password } = await request.json()
    const correctPassword = getAdminPassword()

    if (password === correctPassword) {
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
