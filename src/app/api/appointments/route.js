import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin'
import { getClientIp } from '@/lib/getClientIp'
import { rateLimit } from '@/lib/rateLimit'

const MAX_BODY_BYTES = 512 * 1024 // 512KB
const MAX_PETS = 10
const MAX_OPTIONAL_ITEMS = 50
const MAX_TEXT_LEN = 500
const MAX_SIGNATURE_LEN = 2000

function sanitizeSearch(s) {
  if (typeof s !== 'string') return ''
  const trimmed = s.trim().slice(0, 100)
  return trimmed.replace(/[^\w\s\-']/gi, '')
}

// GET — List all intake submissions (admin only)
export async function GET(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  
  if (!devMode && !isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json(
      {
        error:
          'Server configuration error. Please check Supabase credentials.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const excludeStatus = searchParams.get('excludeStatus')
  const rawSearch = searchParams.get('search')
  const search = rawSearch ? sanitizeSearch(rawSearch) : ''
  const page = Math.min(Math.max(1, parseInt(searchParams.get('page') || '1', 10)), 100)
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)
  const offset = (page - 1) * limit

  const allowedStatuses = ['pending', 'confirmed', 'completed', 'attempted', 'cancelled', 'no-show']
  let query = admin.from('appointments').select('*', { count: 'exact' })

  if (status && status !== 'all') {
    if (allowedStatuses.includes(status)) query = query.eq('status', status)
  }
  if (excludeStatus && allowedStatuses.includes(excludeStatus)) {
    query = query.neq('status', excludeStatus)
  }

  if (search) {
    const term = search.replace(/%/g, '\\%').replace(/_/g, '\\_').replace(/'/g, "''")
    query = query.or(
      `owner_name.ilike.%${term}%,owner_first_name.ilike.%${term}%,owner_last_name.ilike.%${term}%,owner_email.ilike.%${term}%,owner_phone.ilike.%${term}%,city.ilike.%${term}%,street_address.ilike.%${term}%,state.ilike.%${term}%,zip_code.ilike.%${term}%`
    )
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    appointments: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  })
}

// POST — Submit a new intake form (public — no auth required)
export async function POST(request) {
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

  if (!devMode) {
    const ip = getClientIp(request)
    const rl = rateLimit(ip, { windowMs: 60 * 60 * 1000, max: 10 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {} }
      )
    }
    const cl = request.headers.get('content-length')
    if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Supabase client error:', err.message)
    return NextResponse.json(
      {
        error:
          'Server configuration error. Please check Supabase credentials in .env.local',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!devMode) {
    if (body && typeof body === 'object' && JSON.stringify(body).length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }
    if (Array.isArray(body.pets) && body.pets.length > MAX_PETS) {
      return NextResponse.json({ error: 'Too many pets' }, { status: 400 })
    }
    if (Array.isArray(body.optional_vaccines) && body.optional_vaccines.length > MAX_OPTIONAL_ITEMS) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    if (Array.isArray(body.optional_wellness_services) && body.optional_wellness_services.length > MAX_OPTIONAL_ITEMS) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
  }

  // Validate required fields (skipped in dev mode)
  if (!devMode) {
    if (!body.owner_first_name?.trim()) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }
    if (!body.owner_last_name?.trim()) {
      return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
    }
    if (!body.owner_phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }
    if (!body.owner_email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.owner_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!body.street_address?.trim()) {
      return NextResponse.json({ error: 'Street address is required' }, { status: 400 })
    }
    if (!body.city?.trim()) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }
    if (!body.state?.trim()) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 })
    }
    if (!body.zip_code?.trim()) {
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 })
    }
    if (!body.pets || !Array.isArray(body.pets) || body.pets.length === 0) {
      return NextResponse.json({ error: 'At least one pet is required' }, { status: 400 })
    }
    if (!body.legal_acknowledged) {
      return NextResponse.json({ error: 'Legal acknowledgement is required' }, { status: 400 })
    }
    if (!body.signature?.trim()) {
      return NextResponse.json({ error: 'Signature is required' }, { status: 400 })
    }
  }

  const trim = (s, max = MAX_TEXT_LEN) => (typeof s === 'string' ? s.trim().slice(0, max) : '') || ''
  const pets = Array.isArray(body.pets) ? body.pets.slice(0, MAX_PETS) : []
  const optionalVaccines = Array.isArray(body.optional_vaccines) ? body.optional_vaccines.slice(0, MAX_OPTIONAL_ITEMS) : []
  const optionalWellness = Array.isArray(body.optional_wellness_services) ? body.optional_wellness_services.slice(0, MAX_OPTIONAL_ITEMS) : []

  try {
    const { data, error } = await admin
      .from('appointments')
      .insert({
        is_returning_customer: body.is_returning_customer || false,
        owner_name: trim([body.owner_first_name, body.owner_last_name].map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean).join(' ')) || trim(body.owner_name) || '',
        owner_first_name: trim(body.owner_first_name) || '',
        owner_last_name: trim(body.owner_last_name) || '',
        owner_phone: trim(body.owner_phone, 30) || '',
        owner_email: trim(body.owner_email, 100).toLowerCase() || '',
        emergency_contact_name: trim(body.emergency_contact_name) || '',
        emergency_contact_phone: trim(body.emergency_contact_phone, 30) || '',
        preferred_contact: ['call', 'text', 'email'].includes(body.preferred_contact) ? body.preferred_contact : 'call',
        street_address: trim(body.street_address, 300) || '',
        city: trim(body.city, 100) || '',
        state: trim(body.state, 50) || '',
        zip_code: trim(body.zip_code, 20) || '',
        how_heard: trim(body.how_heard) || '',
        requested_service: trim(body.requested_service, 50) || '',
        num_pets: Math.min(pets.length, MAX_PETS),
        pets,
        wants_microchip: (Array.isArray(body.optional_wellness_services) && body.optional_wellness_services.includes('microchip')) || body.wants_microchip || false,
        wants_nail_trim: (Array.isArray(body.optional_wellness_services) && body.optional_wellness_services.includes('nail_trim')) || body.wants_nail_trim || false,
        wants_flea_treatment: optionalWellness.includes('flea_selarid_feline') || optionalWellness.includes('flea_para_defense_k9') || body.wants_flea_treatment || false,
        optional_vaccines: optionalVaccines,
        optional_wellness_services: optionalWellness,
        deposit_acknowledged: body.deposit_acknowledged || false,
        deposit_card_last4: (body.deposit_card_last4 || '').toString().replace(/\D/g, '').slice(0, 4) || '',
        deposit_card_expiry: (body.deposit_card_expiry || '').toString().trim().slice(0, 10) || '',
        deposit_billing_zip: (body.deposit_billing_zip || '').toString().trim().slice(0, 10) || '',
        legal_acknowledged: !!body.legal_acknowledged,
        signature: trim(body.signature, MAX_SIGNATURE_LEN) || '',
        vet_note: trim(body.vet_note, 2000) || '',
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        {
          error: error.message || 'Failed to save submission',
          details:
            process.env.NODE_ENV === 'development'
              ? JSON.stringify(error)
              : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ appointment: data }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }
}
