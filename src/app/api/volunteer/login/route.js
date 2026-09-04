import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminPassword } from '@/lib/auth/admin'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'
import { isValidEmail, isValidPhone, normalizePhone, parseContact } from '@/lib/volunteer/phone'
import {
  isVolunteerAdminEmail,
  setVolunteerCookies,
} from '@/lib/volunteer/auth'

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`volunteer-login:${ip}`, { windowMs: 15 * 60 * 1000, max: 20 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {} }
      )
    }
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = parseContact(body.contact)
  const email = (
    parsed.email || (typeof body.email === 'string' ? body.email.trim().toLowerCase() : '')
  ).slice(0, 200)
  const phoneRaw = (
    parsed.phone || (typeof body.phone === 'string' ? body.phone.trim() : '')
  ).slice(0, 40)

  if (email && isVolunteerAdminEmail(email)) {
    const password = typeof body.password === 'string' ? body.password : ''
    if (password !== getAdminPassword()) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    const response = NextResponse.json({
      isAdmin: true,
      volunteer: { id: null, name: 'Admin', email },
    })
    setVolunteerCookies(response, { volunteerId: null, isAdmin: true })
    return response
  }

  if (email && phoneRaw) {
    return NextResponse.json({ error: 'Use email or phone, not both.' }, { status: 400 })
  }
  if (!email && !phoneRaw) {
    return NextResponse.json({ error: 'Enter your email or phone number.' }, { status: 400 })
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (phoneRaw && !isValidPhone(phoneRaw)) {
    return NextResponse.json({ error: 'Enter a valid 10-digit phone number.' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  let query = admin.from('volunteers').select('id, name, email, phone').limit(1)
  if (email) {
    query = query.eq('email', email)
  } else {
    query = query.eq('phone_normalized', normalizePhone(phoneRaw))
  }

  const { data, error } = await query
  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ error: 'Volunteer tables are not set up yet.' }, { status: 500 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const volunteer = data?.[0]
  if (!volunteer) {
    return NextResponse.json(
      { error: 'No volunteer found. Try the other contact, or sign up as new.' },
      { status: 404 }
    )
  }

  const response = NextResponse.json({ volunteer, isAdmin: false })
  setVolunteerCookies(response, { volunteerId: volunteer.id, isAdmin: false })
  return response
}
