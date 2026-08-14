import { NextResponse } from 'next/server'
import { clearVolunteerCookies } from '@/lib/volunteer/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  clearVolunteerCookies(response)
  return response
}
