import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'
import { isValidEmail, isValidPhone, normalizePhone } from '@/lib/volunteer/phone'
import {
  isVolunteerAdminEmail,
  setVolunteerCookies,
} from '@/lib/volunteer/auth'

export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(`volunteer-register:${ip}`, { windowMs: 60 * 60 * 1000, max: 12 })
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

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : ''
  const phoneRaw = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : ''
  const phone_normalized = phoneRaw ? normalizePhone(phoneRaw) : ''

  if (!name) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (isVolunteerAdminEmail(email)) {
    return NextResponse.json({ error: 'That email is reserved. Use returning volunteer to sign in.' }, { status: 400 })
  }

  const hasEmail = !!email
  const hasPhone = !!phoneRaw
  if (hasEmail && !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (hasPhone && !isValidPhone(phoneRaw)) {
    return NextResponse.json({ error: 'Enter a valid 10-digit phone number.' }, { status: 400 })
  }
  if (!hasEmail && !hasPhone) {
    return NextResponse.json({ error: 'Enter an email or a phone number.' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  if (email) {
    const { data: existing } = await admin
      .from('volunteers')
      .select('id')
        .eq('email', email)
      .limit(1)
    if (existing?.length) {
      return NextResponse.json(
        { error: 'This email is already registered. Use returning volunteer.' },
        { status: 409 }
      )
    }
  }
  if (phone_normalized) {
    const { data: existing } = await admin
      .from('volunteers')
      .select('id')
      .eq('phone_normalized', phone_normalized)
      .limit(1)
    if (existing?.length) {
      return NextResponse.json(
        { error: 'This phone number is already registered. Use returning volunteer.' },
        { status: 409 }
      )
    }
  }

  const { data, error } = await admin
    .from('volunteers')
    .insert({
      name,
      email: email || '',
      phone: phoneRaw || '',
      phone_normalized: phone_normalized || '',
    })
    .select('id, name, email, phone')
    .single()

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ error: 'Volunteer tables are not set up yet.' }, { status: 500 })
    }
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Already registered. Use returning volunteer to sign in.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response = NextResponse.json({ volunteer: data, isAdmin: false })
  setVolunteerCookies(response, { volunteerId: data.id, isAdmin: false })
  return response
}
