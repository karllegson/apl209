import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

const STAFF_COOKIE = 'apl_staff_name'

export async function GET(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const staffName = request.cookies.get(STAFF_COOKIE)?.value || null
  return NextResponse.json({ staffName })
}
