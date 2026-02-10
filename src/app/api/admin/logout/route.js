import { NextResponse } from 'next/server'

const ADMIN_COOKIE = 'apl_admin_session'

export async function GET(request) {
  const url = new URL(request.url)
  const redirectUrl = new URL('/admin', url.origin)
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}

export async function POST(request) {
  const url = new URL(request.url)
  const redirectUrl = new URL('/admin', url.origin)
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}
