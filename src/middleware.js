import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'

export async function middleware(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (devMode) {
    return NextResponse.next({ request })
  }

  const pathname = request.nextUrl.pathname

  // /admin exactly = login page when not authed, redirect to dashboard when authed
  if (pathname === '/admin' || pathname === '/admin/') {
    if (isAdminAuthenticated(request)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  // /admin/dashboard, /admin/appointments = require auth
  if (pathname.startsWith('/admin/')) {
    if (!isAdminAuthenticated(request)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/admin/:path*'],
}
