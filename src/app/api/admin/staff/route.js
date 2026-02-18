import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

const STAFF_COOKIE = 'apl_staff_name'
const STAFF_NAMES = [
  'Karl Legson',
  'Jolene Medeiros',
  'Jaime Goodpasture',
  'April Self',
  'Samantha Holman',
  'Janette Osorio',
  'Libby Torres',
]

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name || !STAFF_NAMES.includes(name)) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(STAFF_COOKIE, name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
